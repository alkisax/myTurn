using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;
using Xunit.Sdk;

namespace MyTurn.Backend.Tests;

public class TicketCreationTests
{
  private static readonly HttpClient Client = new HttpClient { BaseAddress = new Uri("http://localhost:3020") };

  [Fact]
  public async Task AnonymousCustomerCanCreateTicketWithoutEmail()
  {
    await CheckBackendIsRunning();
    TicketSetup setup = await CreateTicketSetup();
    TicketData ticket = await CreateTicket(setup.QueueId, null, null);

    Assert.Equal(setup.QueueId, ticket.QueueId);
    Assert.True(ticket.Id > 0);
    Assert.True(ticket.Number > 0);
    Assert.False(string.IsNullOrWhiteSpace(ticket.Pin));
    Assert.False(string.IsNullOrWhiteSpace(ticket.TrackingToken));
    Assert.Equal("WAITING", ticket.Status);
  }

  [Fact]
  public async Task AnonymousCustomerCanCreateTicketWithOptionalEmail()
  {
    await CheckBackendIsRunning();
    TicketSetup setup = await CreateTicketSetup();
    TicketData ticket = await CreateTicket(setup.QueueId, "test-ticket@example.invalid", null);
    Assert.True(ticket.Id > 0);
    Assert.Equal("WAITING", ticket.Status);
  }

  [Fact]
  public async Task CustomerCanCreateTicketWithOneService()
  {
    await CheckBackendIsRunning();
    TicketSetup setup = await CreateTicketSetup();
    TicketData ticket = await CreateTicket(setup.QueueId, null, new[] { setup.ServiceId });
    Assert.Contains(setup.ServiceId, ticket.ServiceIds);
  }

  [Fact]
  public async Task CustomerCanCreateTicketWithMultipleServices()
  {
    await CheckBackendIsRunning();
    TicketSetup setup = await CreateTicketSetupWithTwoServices();
    TicketData ticket = await CreateTicket(setup.QueueId, null, new[] { setup.ServiceId, setup.SecondServiceId });
    Assert.Contains(setup.ServiceId, ticket.ServiceIds);
    Assert.Contains(setup.SecondServiceId, ticket.ServiceIds);
  }

  [Fact]
  public async Task TicketNumbersIncreaseInTheSameQueue()
  {
    await CheckBackendIsRunning();
    TicketSetup setup = await CreateTicketSetup();
    TicketData firstTicket = await CreateTicket(setup.QueueId, null, null);
    TicketData secondTicket = await CreateTicket(setup.QueueId, null, null);
    Assert.Equal(firstTicket.Number + 1, secondTicket.Number);
  }

  [Fact]
  public async Task InactiveQueueRejectsTicketCreation()
  {
    await CheckBackendIsRunning();
    TicketSetup setup = await CreateTicketSetup();
    var updateBody = new { name = "test_ticket_inactive_queue", isActive = false };
    HttpResponseMessage updateResponse = await SendWithToken(HttpMethod.Put, $"/queues/{setup.QueueId}", setup.AdminToken, updateBody);
    Assert.Equal(HttpStatusCode.OK, updateResponse.StatusCode);

    HttpResponseMessage ticketResponse = await Client.PostAsJsonAsync("/tickets/", new { queueId = setup.QueueId, email = (string?)null, serviceIds = (int[]?)null });
    Assert.Equal(HttpStatusCode.BadRequest, ticketResponse.StatusCode);
  }

  private static async Task<TicketSetup> CreateTicketSetup()
  {
    TicketSetup setup = await CreateBasicSetup();
    setup.ServiceId = await CreateService(setup.AdminToken, setup.LocationId, "test_ticket_service");
    return setup;
  }

  private static async Task<TicketSetup> CreateTicketSetupWithTwoServices()
  {
    TicketSetup setup = await CreateTicketSetup();
    setup.SecondServiceId = await CreateService(setup.AdminToken, setup.LocationId, "test_ticket_second_service");
    return setup;
  }

  private static async Task<TicketSetup> CreateBasicSetup()
  {
    string unique = Guid.NewGuid().ToString("N").Substring(0, 8);
    string username = $"test_ticket_admin_{unique}";
    string password = "TicketPass1!";
    await Register(username, password, "/auth/register-admin");
    string token = await Login(username, password);
    int companyId = await ReadId(await SendWithToken(HttpMethod.Post, "/companies/", token, new { name = $"test_ticket_company_{unique}", missedTicketExpiryMinutes = 10, defaultEstimatedServiceMinutes = 5 }));
    int locationId = await ReadId(await SendWithToken(HttpMethod.Post, "/locations/", token, new { companyId, name = $"test_ticket_location_{unique}", address = "test", country = "GR" }));
    int queueId = await ReadId(await SendWithToken(HttpMethod.Post, "/queues/", token, new { locationId, name = $"test_ticket_queue_{unique}", description = "test", autoResetEnabled = false, resetAt = (string?)null }));
    return new TicketSetup { AdminToken = token, LocationId = locationId, QueueId = queueId };
  }

  private static async Task<int> CreateService(string token, int locationId, string label)
  {
    HttpResponseMessage response = await SendWithToken(HttpMethod.Post, "/services/", token, new { locationId, name = $"{label}_{Guid.NewGuid():N}", description = "test", isGeneric = false, estimatedServiceMinutes = 5 });
    return await ReadId(response);
  }

  private static async Task<TicketData> CreateTicket(int queueId, string? email, int[]? serviceIds)
  {
    HttpResponseMessage response = await Client.PostAsJsonAsync("/tickets/", new { queueId, email, serviceIds });
    string text = await response.Content.ReadAsStringAsync();
    if (response.StatusCode != HttpStatusCode.Created)
    {
      throw new XunitException($"Ticket creation failed with {(int)response.StatusCode}: {text}");
    }
    using JsonDocument json = JsonDocument.Parse(text);
    JsonElement data = json.RootElement.GetProperty("data");
    return new TicketData
    {
      Id = data.GetProperty("id").GetInt32(), QueueId = data.GetProperty("queueId").GetInt32(), Number = data.GetProperty("number").GetInt32(),
      Pin = data.GetProperty("pin").GetString()!, TrackingToken = data.GetProperty("trackingToken").GetString()!, Status = data.GetProperty("status").GetString()!,
      ServiceIds = data.GetProperty("serviceIds").EnumerateArray().Select(item => item.GetInt32()).ToList()
    };
  }

  private static async Task Register(string username, string password, string route)
  {
    HttpResponseMessage response = await Client.PostAsJsonAsync(route, new { username, name = username, email = $"{username}@example.com", password });
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
  }

  private static async Task<string> Login(string username, string password)
  {
    HttpResponseMessage response = await Client.PostAsJsonAsync("/auth/login", new { username, password });
    string text = await response.Content.ReadAsStringAsync();
    using JsonDocument json = JsonDocument.Parse(text);
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    return json.RootElement.GetProperty("data").GetProperty("token").GetString()!;
  }

  private static async Task<int> ReadId(HttpResponseMessage response)
  {
    string text = await response.Content.ReadAsStringAsync();
    using JsonDocument json = JsonDocument.Parse(text);
    Assert.True((int)response.StatusCode >= 200 && (int)response.StatusCode < 300);
    return json.RootElement.GetProperty("data").GetProperty("id").GetInt32();
  }

  private static async Task<HttpResponseMessage> SendWithToken(HttpMethod method, string route, string token, object? body = null)
  {
    HttpRequestMessage request = new HttpRequestMessage(method, route);
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
    if (body is not null) request.Content = JsonContent.Create(body);
    return await Client.SendAsync(request);
  }

  private static async Task CheckBackendIsRunning()
  {
    try { HttpResponseMessage response = await Client.GetAsync("/health"); if (response.StatusCode != HttpStatusCode.OK) throw new XunitException("Το backend δεν είναι διαθέσιμο. Ξεκινήστε το με: dotnet run --project backend/backend.csproj"); }
    catch (HttpRequestException) { throw new XunitException("Το backend δεν τρέχει στο http://localhost:3020. Ξεκινήστε το πρώτα με: dotnet run --project backend/backend.csproj"); }
  }

  private class TicketSetup { public required string AdminToken { get; set; } public int LocationId { get; set; } public int QueueId { get; set; } public int ServiceId { get; set; } public int SecondServiceId { get; set; } }
  private class TicketData { public int Id { get; set; } public int QueueId { get; set; } public int Number { get; set; } public required string Pin { get; set; } public required string TrackingToken { get; set; } public required string Status { get; set; } public required List<int> ServiceIds { get; set; } }
}
