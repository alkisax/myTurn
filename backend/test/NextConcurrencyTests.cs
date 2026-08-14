using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;
using Xunit.Sdk;

[assembly: CollectionBehavior(DisableTestParallelization = true)]

namespace MyTurn.Backend.Tests;

public class NextConcurrencyTests
{
  private static readonly HttpClient Client = new HttpClient { BaseAddress = new Uri("http://localhost:3020") };

  [Fact]
  public async Task StaffWithActiveSessionCanClaimNextTicket()
  {
    await CheckBackendIsRunning();
    NextSetup setup = await CreateSetupWithStaff();
    await CreateTicket(setup.QueueId);
    HttpResponseMessage response = await Send(HttpMethod.Post, "/tickets/next", setup.StaffAToken);
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    Assert.Equal("SERVING", await ReadStatus(response));
  }

  [Fact]
  public async Task SameStaffCannotClaimSecondServingTicket()
  {
    await CheckBackendIsRunning();
    NextSetup setup = await CreateSetupWithStaff();
    await CreateTicket(setup.QueueId);
    await CreateTicket(setup.QueueId);
    Assert.Equal(HttpStatusCode.OK, (await Send(HttpMethod.Post, "/tickets/next", setup.StaffAToken)).StatusCode);
    HttpResponseMessage response = await Send(HttpMethod.Post, "/tickets/next", setup.StaffAToken);
    Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
  }

  [Fact]
  public async Task ServingTicketBlocksSecondTicketOnSameDesk()
  {
    await CheckBackendIsRunning();
    NextSetup setup = await CreateSetupWithTwoStaffOnOneDesk();
    await CreateTicket(setup.QueueId);
    await CreateTicket(setup.QueueId);
    Assert.Equal(HttpStatusCode.OK, (await Send(HttpMethod.Post, "/tickets/next", setup.StaffAToken)).StatusCode);
    Assert.Equal(HttpStatusCode.OK, (await Send(HttpMethod.Post, $"/staff-sessions/{setup.StaffASessionId}/end", setup.StaffAToken)).StatusCode);
    HttpResponseMessage secondSession = await Send(HttpMethod.Post, "/staff-sessions/", setup.StaffBToken, new { deskId = setup.DeskId });
    Assert.Equal(HttpStatusCode.Created, secondSession.StatusCode);
    HttpResponseMessage response = await Send(HttpMethod.Post, "/tickets/next", setup.StaffBToken);
    Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
  }

  [Fact]
  public async Task SameStaffCannotOpenTwoSessions()
  {
    await CheckBackendIsRunning();
    NextSetup setup = await CreateSetupWithStaff();
    HttpResponseMessage response = await Send(HttpMethod.Post, "/staff-sessions/", setup.StaffAToken, new { deskId = setup.DeskId });
    Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
  }

  [Fact]
  public async Task SameDeskCannotHaveTwoOpenSessions()
  {
    await CheckBackendIsRunning();
    NextSetup setup = await CreateSetupWithTwoStaffOnOneDesk();
    HttpResponseMessage response = await Send(HttpMethod.Post, "/staff-sessions/", setup.StaffBToken, new { deskId = setup.DeskId });
    Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
  }

  [Fact]
  public async Task TwoCloseTicketRequestsGetDifferentNumbers()
  {
    await CheckBackendIsRunning();
    NextSetup setup = await CreateSetup();
    Task<HttpResponseMessage> firstRequest = Client.PostAsJsonAsync("/tickets/", new { queueId = setup.QueueId, email = (string?)null, serviceIds = (int[]?)null });
    Task<HttpResponseMessage> secondRequest = Client.PostAsJsonAsync("/tickets/", new { queueId = setup.QueueId, email = (string?)null, serviceIds = (int[]?)null });
    HttpResponseMessage[] responses = await Task.WhenAll(firstRequest, secondRequest);
    int firstNumber = await ReadNumber(responses[0]);
    int secondNumber = await ReadNumber(responses[1]);
    Assert.Equal(HttpStatusCode.Created, responses[0].StatusCode);
    Assert.Equal(HttpStatusCode.Created, responses[1].StatusCode);
    Assert.NotEqual(firstNumber, secondNumber);
    Assert.Equal(1, Math.Abs(firstNumber - secondNumber));
  }

  private static async Task<NextSetup> CreateSetupWithStaff()
  {
    NextSetup setup = await CreateSetup();
    await CreateStaff(setup.AdminToken, setup.CompanyId, setup.StaffAUsername, setup.StaffAPassword);
    setup.StaffAToken = await Login(setup.StaffAUsername, setup.StaffAPassword);
    setup.StaffASessionId = await ReadId(await Send(HttpMethod.Post, "/staff-sessions/", setup.StaffAToken, new { deskId = setup.DeskId }));
    return setup;
  }

  private static async Task<NextSetup> CreateSetupWithTwoStaffOnOneDesk()
  {
    NextSetup setup = await CreateSetupWithStaff();
    await CreateStaff(setup.AdminToken, setup.CompanyId, setup.StaffBUsername, setup.StaffBPassword);
    setup.StaffBToken = await Login(setup.StaffBUsername, setup.StaffBPassword);
    return setup;
  }

  private static async Task<NextSetup> CreateSetup()
  {
    string unique = Guid.NewGuid().ToString("N").Substring(0, 8);
    string admin = $"test_next_admin_{unique}";
    string password = "NextAdmin1!";
    await Register(admin, password, "/auth/register-admin");
    string token = await Login(admin, password);
    int company = await ReadId(await Send(HttpMethod.Post, "/companies/", token, new { name = $"test_next_company_{unique}", missedTicketExpiryMinutes = 10, defaultEstimatedServiceMinutes = 5 }));
    int location = await ReadId(await Send(HttpMethod.Post, "/locations/", token, new { companyId = company, name = $"test_next_location_{unique}", address = "test", country = "GR" }));
    int queue = await ReadId(await Send(HttpMethod.Post, "/queues/", token, new { locationId = location, name = $"test_next_queue_{unique}", description = "test", autoResetEnabled = false, resetAt = (string?)null }));
    int desk = await ReadId(await Send(HttpMethod.Post, "/desks/", token, new { locationId = location, queueId = queue, name = $"test_next_desk_{unique}" }));
    return new NextSetup { AdminToken = token, CompanyId = company, QueueId = queue, DeskId = desk, StaffAUsername = $"test_next_staff_a_{unique}", StaffAPassword = "NextStaffA1!", StaffBUsername = $"test_next_staff_b_{unique}", StaffBPassword = "NextStaffB1!" };
  }

  private static async Task CreateStaff(string adminToken, int companyId, string username, string password)
  {
    HttpResponseMessage response = await Send(HttpMethod.Post, $"/company-users/company/{companyId}/staff", adminToken, new { username, name = username, email = $"{username}@example.com", password });
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
  }

  private static async Task<int> CreateTicket(int queueId)
  {
    return await ReadId(await Client.PostAsJsonAsync("/tickets/", new { queueId, email = (string?)null, serviceIds = (int[]?)null }));
  }

  private static async Task Register(string username, string password, string route)
  {
    Assert.Equal(HttpStatusCode.Created, (await Client.PostAsJsonAsync(route, new { username, name = username, email = $"{username}@example.com", password })).StatusCode);
  }

  private static async Task<string> Login(string username, string password)
  {
    HttpResponseMessage response = await Client.PostAsJsonAsync("/auth/login", new { username, password });
    string text = await response.Content.ReadAsStringAsync(); using JsonDocument json = JsonDocument.Parse(text);
    Assert.Equal(HttpStatusCode.OK, response.StatusCode); return json.RootElement.GetProperty("data").GetProperty("token").GetString()!;
  }

  private static async Task<HttpResponseMessage> Send(HttpMethod method, string route, string token, object? body = null)
  {
    HttpRequestMessage request = new HttpRequestMessage(method, route); request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token); if (body is not null) request.Content = JsonContent.Create(body); return await Client.SendAsync(request);
  }

  private static async Task<int> ReadId(HttpResponseMessage response)
  {
    string text = await response.Content.ReadAsStringAsync(); using JsonDocument json = JsonDocument.Parse(text); Assert.True((int)response.StatusCode >= 200 && (int)response.StatusCode < 300); return json.RootElement.GetProperty("data").GetProperty("id").GetInt32();
  }

  private static async Task<int> ReadNumber(HttpResponseMessage response)
  {
    string text = await response.Content.ReadAsStringAsync(); using JsonDocument json = JsonDocument.Parse(text); return json.RootElement.GetProperty("data").GetProperty("number").GetInt32();
  }

  private static async Task<string> ReadStatus(HttpResponseMessage response)
  {
    string text = await response.Content.ReadAsStringAsync(); using JsonDocument json = JsonDocument.Parse(text); return json.RootElement.GetProperty("data").GetProperty("status").GetString()!;
  }

  private static async Task CheckBackendIsRunning()
  {
    try { HttpResponseMessage response = await Client.GetAsync("/health"); if (response.StatusCode != HttpStatusCode.OK) throw new XunitException("Το backend δεν είναι διαθέσιμο. Ξεκινήστε το με: dotnet run --project backend/backend.csproj"); } catch (HttpRequestException) { throw new XunitException("Το backend δεν τρέχει στο http://localhost:3020. Ξεκινήστε το πρώτα με: dotnet run --project backend/backend.csproj"); }
  }

  private class NextSetup
  {
    public required string AdminToken { get; set; } public required string StaffAUsername { get; set; } public required string StaffAPassword { get; set; } public required string StaffBUsername { get; set; } public required string StaffBPassword { get; set; } public string StaffAToken { get; set; } = ""; public string StaffBToken { get; set; } = ""; public int CompanyId { get; set; } public int QueueId { get; set; } public int DeskId { get; set; } public int StaffASessionId { get; set; }
  }
}
