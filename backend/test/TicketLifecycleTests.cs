using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;
using Xunit.Sdk;

namespace MyTurn.Backend.Tests;

public class TicketLifecycleTests
{
  private static readonly HttpClient Client = new HttpClient { BaseAddress = new Uri("http://localhost:3020") };

  [Fact]
  public async Task WaitingTicketBecomesServingWithNext()
  {
    await CheckBackendIsRunning();
    LifecycleSetup setup = await CreateSetupWithStaffSession();
    int ticketId = await CreateTicket(setup.QueueId);
    HttpResponseMessage response = await SendWithToken(HttpMethod.Post, "/tickets/next", setup.StaffToken);
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    Assert.Equal(ticketId, await ReadId(response));
    Assert.Equal("SERVING", await ReadStatus(response));
  }

  [Fact]
  public async Task ServingTicketCanBeCompletedWithSuccess()
  {
    await CheckBackendIsRunning();
    LifecycleSetup setup = await CreateSetupWithStaffSession();
    await CreateTicket(setup.QueueId);
    int ticketId = await ClaimNext(setup.StaffToken);
    HttpResponseMessage response = await SendWithToken(HttpMethod.Post, $"/tickets/{ticketId}/complete", setup.StaffToken, new { completionResult = "SUCCESS" });
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    Assert.Equal("COMPLETED", await ReadStatus(response));
  }

  [Fact]
  public async Task ServingTicketCanBeCompletedWithFailedResult()
  {
    await CheckBackendIsRunning();
    LifecycleSetup setup = await CreateSetupWithStaffSession();
    await CreateTicket(setup.QueueId);
    int ticketId = await ClaimNext(setup.StaffToken);
    HttpResponseMessage response = await SendWithToken(HttpMethod.Post, $"/tickets/{ticketId}/complete", setup.StaffToken, new { completionResult = "FAILED" });
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    Assert.Equal("COMPLETED", await ReadStatus(response));
  }

  [Fact]
  public async Task ServingTicketCanBeMarkedMissed()
  {
    await CheckBackendIsRunning();
    LifecycleSetup setup = await CreateSetupWithStaffSession();
    await CreateTicket(setup.QueueId);
    int ticketId = await ClaimNext(setup.StaffToken);
    HttpResponseMessage response = await SendWithToken(HttpMethod.Post, $"/tickets/{ticketId}/missed", setup.StaffToken);
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    Assert.Equal("MISSED", await ReadStatus(response));
  }

  [Fact]
  public async Task MissedTicketCanBeRecalledAsServing()
  {
    await CheckBackendIsRunning();
    LifecycleSetup setup = await CreateSetupWithStaffSession();
    await CreateTicket(setup.QueueId);
    int ticketId = await ClaimNext(setup.StaffToken);
    await SendWithToken(HttpMethod.Post, $"/tickets/{ticketId}/missed", setup.StaffToken);
    HttpResponseMessage response = await SendWithToken(HttpMethod.Post, $"/tickets/{ticketId}/recall", setup.StaffToken);
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    Assert.Equal("SERVING", await ReadStatus(response));
    await SendWithToken(HttpMethod.Post, $"/tickets/{ticketId}/complete", setup.StaffToken, new { completionResult = "SUCCESS" });
  }

  [Fact]
  public async Task AuthenticatedUserCanCancelWaitingTicket()
  {
    await CheckBackendIsRunning();
    LifecycleSetup setup = await CreateSetup();
    string username = $"test_lifecycle_user_{Guid.NewGuid().ToString("N").Substring(0, 8)}";
    string password = "LifecycleUser1!";
    await Register(username, password, "/auth/register-user");
    string userToken = await Login(username, password);
    int ticketId = await CreateTicket(setup.QueueId, userToken);
    HttpResponseMessage response = await SendWithToken(HttpMethod.Post, $"/tickets/{ticketId}/cancel", userToken);
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    Assert.Equal("CANCELLED", await ReadStatus(response));
  }

  [Fact]
  public async Task WaitingTicketCannotBeCompletedBeforeItIsClaimed()
  {
    await CheckBackendIsRunning();
    LifecycleSetup setup = await CreateSetupWithStaffSession();
    int ticketId = await CreateTicket(setup.QueueId);
    HttpResponseMessage response = await SendWithToken(HttpMethod.Post, $"/tickets/{ticketId}/complete", setup.StaffToken, new { completionResult = "SUCCESS" });
    Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
  }

  private static async Task<LifecycleSetup> CreateSetupWithStaffSession()
  {
    LifecycleSetup setup = await CreateSetup();
    await CreateStaff(setup.AdminToken, setup.CompanyId, setup.StaffUsername, setup.StaffPassword);
    setup.StaffToken = await Login(setup.StaffUsername, setup.StaffPassword);
    HttpResponseMessage sessionResponse = await SendWithToken(HttpMethod.Post, "/staff-sessions/", setup.StaffToken, new { deskId = setup.DeskId });
    Assert.Equal(HttpStatusCode.Created, sessionResponse.StatusCode);
    return setup;
  }

  private static async Task<LifecycleSetup> CreateSetup()
  {
    string unique = Guid.NewGuid().ToString("N").Substring(0, 8);
    string adminUsername = $"test_lifecycle_admin_{unique}";
    string adminPassword = "LifecycleAdmin1!";
    await Register(adminUsername, adminPassword, "/auth/register-admin");
    string adminToken = await Login(adminUsername, adminPassword);
    int companyId = await ReadId(await SendWithToken(HttpMethod.Post, "/companies/", adminToken, new { name = $"test_lifecycle_company_{unique}", missedTicketExpiryMinutes = 10, defaultEstimatedServiceMinutes = 5 }));
    int locationId = await ReadId(await SendWithToken(HttpMethod.Post, "/locations/", adminToken, new { companyId, name = $"test_lifecycle_location_{unique}", address = "test", country = "GR" }));
    int queueId = await ReadId(await SendWithToken(HttpMethod.Post, "/queues/", adminToken, new { locationId, name = $"test_lifecycle_queue_{unique}", description = "test", autoResetEnabled = false, resetAt = (string?)null }));
    int deskId = await ReadId(await SendWithToken(HttpMethod.Post, "/desks/", adminToken, new { locationId, queueId, name = $"test_lifecycle_desk_{unique}" }));
    return new LifecycleSetup { AdminToken = adminToken, CompanyId = companyId, QueueId = queueId, DeskId = deskId, StaffUsername = $"test_lifecycle_staff_{unique}", StaffPassword = "LifecycleStaff1!" };
  }

  private static async Task<int> CreateTicket(int queueId, string? userToken = null)
  {
    HttpResponseMessage response;
    if (userToken is null)
    {
      response = await Client.PostAsJsonAsync("/tickets/", new { queueId, email = (string?)null, serviceIds = (int[]?)null });
    }
    else
    {
      response = await SendWithToken(HttpMethod.Post, "/tickets/", userToken, new { queueId, email = (string?)null, serviceIds = (int[]?)null });
    }
    return await ReadId(response);
  }

  private static async Task<int> ClaimNext(string token)
  {
    HttpResponseMessage response = await SendWithToken(HttpMethod.Post, "/tickets/next", token);
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    return await ReadId(response);
  }

  private static async Task CreateStaff(string adminToken, int companyId, string username, string password)
  {
    HttpResponseMessage response = await SendWithToken(HttpMethod.Post, $"/company-users/company/{companyId}/staff", adminToken, new { username, name = username, email = $"{username}@example.com", password });
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
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

  private static async Task<string> ReadStatus(HttpResponseMessage response)
  {
    string text = await response.Content.ReadAsStringAsync();
    using JsonDocument json = JsonDocument.Parse(text);
    return json.RootElement.GetProperty("data").GetProperty("status").GetString()!;
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

  private class LifecycleSetup
  {
    public required string AdminToken { get; set; }
    public string StaffToken { get; set; } = "";
    public required string StaffUsername { get; set; }
    public required string StaffPassword { get; set; }
    public int CompanyId { get; set; }
    public int QueueId { get; set; }
    public int DeskId { get; set; }
  }
}
