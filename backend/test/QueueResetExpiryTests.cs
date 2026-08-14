using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;
using Xunit.Sdk;

namespace MyTurn.Backend.Tests;

public class QueueResetExpiryTests
{
  private static readonly HttpClient Client = new HttpClient { BaseAddress = new Uri("http://localhost:3020") };

  [Fact]
  public async Task ManualResetExpiresWaitingTicket()
  {
    await CheckBackendIsRunning();
    ResetSetup setup = await CreateSetup();
    TicketData ticket = await CreateTicket(setup.QueueId);
    Assert.Equal(HttpStatusCode.OK, (await Send(HttpMethod.Post, $"/queues/{setup.QueueId}/reset", setup.AdminToken)).StatusCode);
    Assert.Equal("EXPIRED", await GetTicketStatus(ticket.TrackingToken));
  }

  [Fact]
  public async Task ManualResetExpiresMissedTicket()
  {
    await CheckBackendIsRunning();
    ResetSetup setup = await CreateSetupWithStaff();
    TicketData ticket = await CreateTicket(setup.QueueId);
    Assert.Equal(HttpStatusCode.OK, (await Send(HttpMethod.Post, "/tickets/next", setup.StaffToken)).StatusCode);
    Assert.Equal(HttpStatusCode.OK, (await Send(HttpMethod.Post, $"/tickets/{ticket.Id}/missed", setup.StaffToken)).StatusCode);
    Assert.Equal(HttpStatusCode.OK, (await Send(HttpMethod.Post, $"/queues/{setup.QueueId}/reset", setup.AdminToken)).StatusCode);
    Assert.Equal("EXPIRED", await GetTicketStatus(ticket.TrackingToken));
  }

  [Fact]
  public async Task ManualResetDoesNotExpireServingTicket()
  {
    await CheckBackendIsRunning();
    ResetSetup setup = await CreateSetupWithStaff();
    TicketData ticket = await CreateTicket(setup.QueueId);
    Assert.Equal(HttpStatusCode.OK, (await Send(HttpMethod.Post, "/tickets/next", setup.StaffToken)).StatusCode);
    Assert.Equal(HttpStatusCode.OK, (await Send(HttpMethod.Post, $"/queues/{setup.QueueId}/reset", setup.AdminToken)).StatusCode);
    Assert.Equal("SERVING", await GetTicketStatus(ticket.TrackingToken));
    await Send(HttpMethod.Post, $"/tickets/{ticket.Id}/complete", setup.StaffToken, new { completionResult = "SUCCESS" });
  }

  [Fact]
  public async Task ManualResetUpdatesResetMetadata()
  {
    await CheckBackendIsRunning();
    ResetSetup setup = await CreateSetup();
    Assert.Equal(HttpStatusCode.OK, (await Send(HttpMethod.Post, $"/queues/{setup.QueueId}/reset", setup.AdminToken)).StatusCode);
    HttpResponseMessage response = await Send(HttpMethod.Get, $"/queues/{setup.QueueId}", setup.AdminToken);
    string text = await response.Content.ReadAsStringAsync(); using JsonDocument json = JsonDocument.Parse(text); JsonElement data = json.RootElement.GetProperty("data");
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    Assert.NotEqual(JsonValueKind.Null, data.GetProperty("lastResetAt").ValueKind);
    Assert.NotEqual(JsonValueKind.Null, data.GetProperty("lastNumberResetAt").ValueKind);
  }

  [Fact]
  public async Task ManualNumberResetMakesNextTicketNumberStartAtOne()
  {
    await CheckBackendIsRunning();
    ResetSetup setup = await CreateSetup();
    TicketData oldTicket = await CreateTicket(setup.QueueId);
    Assert.True(oldTicket.Number > 0);
    Assert.Equal(HttpStatusCode.OK, (await Send(HttpMethod.Post, $"/queues/{setup.QueueId}/reset", setup.AdminToken)).StatusCode);
    TicketData newTicket = await CreateTicket(setup.QueueId);
    Assert.Equal(1, newTicket.Number);
  }

  [Fact]
  public async Task MissedExpiryDoesNotExpireBeforeConfiguredMinutesPass()
  {
    await CheckBackendIsRunning();
    ResetSetup setup = await CreateSetupWithStaff();
    TicketData ticket = await CreateTicket(setup.QueueId);
    Assert.Equal(HttpStatusCode.OK, (await Send(HttpMethod.Post, "/tickets/next", setup.StaffToken)).StatusCode);
    Assert.Equal(HttpStatusCode.OK, (await Send(HttpMethod.Post, $"/tickets/{ticket.Id}/missed", setup.StaffToken)).StatusCode);
    // Το API δέχεται τουλάχιστον 1 λεπτό. Δεν κάνουμε long sleep σε smoke test.
    await Send(HttpMethod.Get, $"/tickets/queue/{setup.QueueId}", setup.StaffToken);
    Assert.Equal("MISSED", await GetTicketStatus(ticket.TrackingToken));
  }

  [Fact]
  public async Task ServingTicketIsNotExpiredByMissedExpiryTrigger()
  {
    await CheckBackendIsRunning();
    ResetSetup setup = await CreateSetupWithStaff();
    TicketData ticket = await CreateTicket(setup.QueueId);
    Assert.Equal(HttpStatusCode.OK, (await Send(HttpMethod.Post, "/tickets/next", setup.StaffToken)).StatusCode);
    await Send(HttpMethod.Get, $"/tickets/queue/{setup.QueueId}", setup.StaffToken);
    Assert.Equal("SERVING", await GetTicketStatus(ticket.TrackingToken));
    await Send(HttpMethod.Post, $"/tickets/{ticket.Id}/complete", setup.StaffToken, new { completionResult = "SUCCESS" });
  }

  private static async Task<ResetSetup> CreateSetupWithStaff()
  {
    ResetSetup setup = await CreateSetup();
    await CreateStaff(setup.AdminToken, setup.CompanyId, setup.StaffUsername, setup.StaffPassword);
    setup.StaffToken = await Login(setup.StaffUsername, setup.StaffPassword);
    Assert.Equal(HttpStatusCode.Created, (await Send(HttpMethod.Post, "/staff-sessions/", setup.StaffToken, new { deskId = setup.DeskId })).StatusCode);
    return setup;
  }

  private static async Task<ResetSetup> CreateSetup()
  {
    string unique = Guid.NewGuid().ToString("N").Substring(0, 8); string admin = $"test_reset_admin_{unique}"; string password = "ResetAdmin1!";
    await Register(admin, password, "/auth/register-admin"); string token = await Login(admin, password);
    int company = await ReadId(await Send(HttpMethod.Post, "/companies/", token, new { name = $"test_reset_company_{unique}", missedTicketExpiryMinutes = 1, defaultEstimatedServiceMinutes = 5 }));
    int location = await ReadId(await Send(HttpMethod.Post, "/locations/", token, new { companyId = company, name = $"test_reset_location_{unique}", address = "test", country = "GR" }));
    int queue = await ReadId(await Send(HttpMethod.Post, "/queues/", token, new { locationId = location, name = $"test_reset_queue_{unique}", description = "test", autoResetEnabled = false, resetAt = (string?)null, resetNumberDaily = true }));
    int desk = await ReadId(await Send(HttpMethod.Post, "/desks/", token, new { locationId = location, queueId = queue, name = $"test_reset_desk_{unique}" }));
    return new ResetSetup { AdminToken = token, CompanyId = company, QueueId = queue, DeskId = desk, StaffUsername = $"test_reset_staff_{unique}", StaffPassword = "ResetStaff1!" };
  }

  private static async Task<TicketData> CreateTicket(int queueId)
  {
    HttpResponseMessage response = await Client.PostAsJsonAsync("/tickets/", new { queueId, email = (string?)null, serviceIds = (int[]?)null }); string text = await response.Content.ReadAsStringAsync(); using JsonDocument json = JsonDocument.Parse(text); Assert.Equal(HttpStatusCode.Created, response.StatusCode); JsonElement data = json.RootElement.GetProperty("data"); return new TicketData { Id = data.GetProperty("id").GetInt32(), Number = data.GetProperty("number").GetInt32(), TrackingToken = data.GetProperty("trackingToken").GetString()! };
  }

  private static async Task<string> GetTicketStatus(string trackingToken)
  {
    HttpResponseMessage response = await Client.GetAsync($"/tickets/{trackingToken}"); string text = await response.Content.ReadAsStringAsync(); using JsonDocument json = JsonDocument.Parse(text); Assert.Equal(HttpStatusCode.OK, response.StatusCode); return json.RootElement.GetProperty("data").GetProperty("status").GetString()!;
  }

  private static async Task CreateStaff(string token, int companyId, string username, string password)
  {
    Assert.Equal(HttpStatusCode.Created, (await Send(HttpMethod.Post, $"/company-users/company/{companyId}/staff", token, new { username, name = username, email = $"{username}@example.com", password })).StatusCode);
  }

  private static async Task Register(string username, string password, string route) { Assert.Equal(HttpStatusCode.Created, (await Client.PostAsJsonAsync(route, new { username, name = username, email = $"{username}@example.com", password })).StatusCode); }
  private static async Task<string> Login(string username, string password) { HttpResponseMessage response = await Client.PostAsJsonAsync("/auth/login", new { username, password }); string text = await response.Content.ReadAsStringAsync(); using JsonDocument json = JsonDocument.Parse(text); Assert.Equal(HttpStatusCode.OK, response.StatusCode); return json.RootElement.GetProperty("data").GetProperty("token").GetString()!; }
  private static async Task<int> ReadId(HttpResponseMessage response) { string text = await response.Content.ReadAsStringAsync(); using JsonDocument json = JsonDocument.Parse(text); Assert.True((int)response.StatusCode >= 200 && (int)response.StatusCode < 300); return json.RootElement.GetProperty("data").GetProperty("id").GetInt32(); }
  private static async Task<HttpResponseMessage> Send(HttpMethod method, string route, string token, object? body = null) { HttpRequestMessage request = new HttpRequestMessage(method, route); request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token); if (body is not null) request.Content = JsonContent.Create(body); return await Client.SendAsync(request); }
  private static async Task CheckBackendIsRunning() { try { HttpResponseMessage response = await Client.GetAsync("/health"); if (response.StatusCode != HttpStatusCode.OK) throw new XunitException("Το backend δεν είναι διαθέσιμο. Ξεκινήστε το με: dotnet run --project backend/backend.csproj"); } catch (HttpRequestException) { throw new XunitException("Το backend δεν τρέχει στο http://localhost:3020. Ξεκινήστε το πρώτα με: dotnet run --project backend/backend.csproj"); } }

  private class ResetSetup { public required string AdminToken { get; set; } public required string StaffUsername { get; set; } public required string StaffPassword { get; set; } public string StaffToken { get; set; } = ""; public int CompanyId { get; set; } public int QueueId { get; set; } public int DeskId { get; set; } }
  private class TicketData { public int Id { get; set; } public int Number { get; set; } public required string TrackingToken { get; set; } }
}
