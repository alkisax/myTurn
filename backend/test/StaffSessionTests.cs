using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;
using Xunit.Sdk;

namespace MyTurn.Backend.Tests;

public class StaffSessionTests
{
  private static readonly HttpClient Client = new HttpClient
  {
    BaseAddress = new Uri("http://localhost:3020")
  };

  [Fact]
  public async Task AdminCanCreateStaffAccountForCompany()
  {
    await CheckBackendIsRunning();
    StaffSetup setup = await CreateSetup();
    HttpResponseMessage response = await CreateStaff(setup.AdminToken, setup.CompanyId, setup.StaffUsername);
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
  }

  [Fact]
  public async Task StaffCanLogin()
  {
    await CheckBackendIsRunning();
    StaffSetup setup = await CreateSetup();
    await CreateStaff(setup.AdminToken, setup.CompanyId, setup.StaffUsername);
    string token = await Login(setup.StaffUsername, setup.StaffPassword);
    Assert.False(string.IsNullOrWhiteSpace(token));
  }

  [Fact]
  public async Task StaffCanStartSessionOnDesk()
  {
    await CheckBackendIsRunning();
    StaffSetup setup = await CreateSetupAndStaff();
    HttpResponseMessage response = await SendWithToken(HttpMethod.Post, "/staff-sessions/", setup.StaffToken, new { deskId = setup.DeskId });
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
  }

  [Fact]
  public async Task StaffCanGetActiveSessionFromMine()
  {
    await CheckBackendIsRunning();
    StaffSetup setup = await CreateSetupAndStaff();
    int sessionId = await StartSession(setup);
    HttpResponseMessage response = await SendWithToken(HttpMethod.Get, "/staff-sessions/mine", setup.StaffToken);
    string responseText = await response.Content.ReadAsStringAsync();
    using JsonDocument json = JsonDocument.Parse(responseText);
    int returnedId = json.RootElement.GetProperty("data").GetProperty("id").GetInt32();
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    Assert.Equal(sessionId, returnedId);
  }

  [Fact]
  public async Task StaffCanChangeActiveSessionToBreak()
  {
    await CheckBackendIsRunning();
    StaffSetup setup = await CreateSetupAndStaff();
    int sessionId = await StartSession(setup);
    HttpResponseMessage response = await SendWithToken(HttpMethod.Put, $"/staff-sessions/{sessionId}/status", setup.StaffToken, new { status = "BREAK" });
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
  }

  [Fact]
  public async Task StaffCanChangeBreakSessionBackToActive()
  {
    await CheckBackendIsRunning();
    StaffSetup setup = await CreateSetupAndStaff();
    int sessionId = await StartSession(setup);
    await SendWithToken(HttpMethod.Put, $"/staff-sessions/{sessionId}/status", setup.StaffToken, new { status = "BREAK" });
    HttpResponseMessage response = await SendWithToken(HttpMethod.Put, $"/staff-sessions/{sessionId}/status", setup.StaffToken, new { status = "ACTIVE" });
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
  }

  [Fact]
  public async Task StaffCanEndSession()
  {
    await CheckBackendIsRunning();
    StaffSetup setup = await CreateSetupAndStaff();
    int sessionId = await StartSession(setup);
    HttpResponseMessage response = await SendWithToken(HttpMethod.Post, $"/staff-sessions/{sessionId}/end", setup.StaffToken);
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
  }

  [Fact]
  public async Task SameStaffCannotStartSecondActiveSession()
  {
    await CheckBackendIsRunning();
    StaffSetup setup = await CreateSetupAndStaff();
    await StartSession(setup);
    HttpResponseMessage response = await SendWithToken(HttpMethod.Post, "/staff-sessions/", setup.StaffToken, new { deskId = setup.DeskId });
    Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
  }

  private static async Task<StaffSetup> CreateSetup()
  {
    string uniqueText = Guid.NewGuid().ToString("N").Substring(0, 8);
    string adminUsername = $"test_staff_admin_{uniqueText}";
    string password = "StaffPass1!";
    await Register(adminUsername, password, "/auth/register-admin");
    string adminToken = await Login(adminUsername, password);
    int companyId = await ReadId(await SendWithToken(HttpMethod.Post, "/companies/", adminToken, new { name = $"test_staff_company_{uniqueText}", missedTicketExpiryMinutes = 10, defaultEstimatedServiceMinutes = 5 }));
    int locationId = await ReadId(await SendWithToken(HttpMethod.Post, "/locations/", adminToken, new { companyId, name = $"test_staff_location_{uniqueText}", address = "test address", country = "GR" }));
    int queueId = await ReadId(await SendWithToken(HttpMethod.Post, "/queues/", adminToken, new { locationId, name = $"test_staff_queue_{uniqueText}", description = "test queue", autoResetEnabled = false, resetAt = (string?)null }));
    int deskId = await ReadId(await SendWithToken(HttpMethod.Post, "/desks/", adminToken, new { locationId, queueId, name = $"test_staff_desk_{uniqueText}" }));
    return new StaffSetup { AdminToken = adminToken, CompanyId = companyId, DeskId = deskId, StaffUsername = $"test_staff_user_{uniqueText}", StaffPassword = "StaffUserPass1!" };
  }

  private static async Task<StaffSetup> CreateSetupAndStaff()
  {
    StaffSetup setup = await CreateSetup();
    HttpResponseMessage response = await CreateStaff(setup.AdminToken, setup.CompanyId, setup.StaffUsername);
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    setup.StaffToken = await Login(setup.StaffUsername, setup.StaffPassword);
    return setup;
  }

  private static async Task<HttpResponseMessage> CreateStaff(string adminToken, int companyId, string username)
  {
    var body = new { username, name = "test_staff_user", email = $"{username}@example.com", password = "StaffUserPass1!" };
    return await SendWithToken(HttpMethod.Post, $"/company-users/company/{companyId}/staff", adminToken, body);
  }

  private static async Task<int> StartSession(StaffSetup setup)
  {
    HttpResponseMessage response = await SendWithToken(HttpMethod.Post, "/staff-sessions/", setup.StaffToken, new { deskId = setup.DeskId });
    int id = await ReadId(response);
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    return id;
  }

  private static async Task Register(string username, string password, string route)
  {
    HttpResponseMessage response = await Client.PostAsJsonAsync(route, new { username, name = username, email = $"{username}@example.com", password });
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
  }

  private static async Task<string> Login(string username, string password)
  {
    HttpResponseMessage response = await Client.PostAsJsonAsync("/auth/login", new { username, password });
    string responseText = await response.Content.ReadAsStringAsync();
    using JsonDocument json = JsonDocument.Parse(responseText);
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    return json.RootElement.GetProperty("data").GetProperty("token").GetString()!;
  }

  private static async Task<int> ReadId(HttpResponseMessage response)
  {
    string responseText = await response.Content.ReadAsStringAsync();
    using JsonDocument json = JsonDocument.Parse(responseText);
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
    try
    {
      HttpResponseMessage response = await Client.GetAsync("/health");
      if (response.StatusCode != HttpStatusCode.OK) throw new XunitException("Το backend δεν είναι διαθέσιμο. Ξεκινήστε το με: dotnet run --project backend/backend.csproj");
    }
    catch (HttpRequestException)
    {
      throw new XunitException("Το backend δεν τρέχει στο http://localhost:3020. Ξεκινήστε το πρώτα με: dotnet run --project backend/backend.csproj");
    }
  }

  private class StaffSetup
  {
    public required string AdminToken { get; set; }
    public string StaffToken { get; set; } = "";
    public required string StaffUsername { get; set; }
    public required string StaffPassword { get; set; }
    public int CompanyId { get; set; }
    public int DeskId { get; set; }
  }
}
