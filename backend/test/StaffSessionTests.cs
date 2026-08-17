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
  public async Task PublicNowServingSnapshotContainsServingTicketAndReturnsEmptyAfterCompletion()
  {
    await CheckBackendIsRunning();
    StaffSetup setup = await CreateSetupAndStaff();
    await StartSession(setup);
    int ticketId = await CreateTicket(setup.QueueId);
    await SendWithToken(HttpMethod.Post, "/tickets/next", setup.StaffToken);

    HttpResponseMessage servingResponse = await Client.GetAsync(
      $"/public/{setup.CompanySlug}/{setup.LocationSlug}/now-serving"
    );
    using JsonDocument servingJson = JsonDocument.Parse(
      await servingResponse.Content.ReadAsStringAsync()
    );

    Assert.Equal(HttpStatusCode.OK, servingResponse.StatusCode);
    JsonElement serving = Assert.Single(
      servingJson.RootElement.GetProperty("data").EnumerateArray()
    );
    Assert.True(serving.GetProperty("number").GetInt32() > 0);
    Assert.Equal(setup.QueueId, serving.GetProperty("queueId").GetInt32());
    Assert.Equal(setup.DeskId, serving.GetProperty("deskId").GetInt32());

    HttpResponseMessage complete = await SendWithToken(
      HttpMethod.Post,
      $"/tickets/{ticketId}/complete",
      setup.StaffToken,
      new { completionResult = "SUCCESS" }
    );
    Assert.Equal(HttpStatusCode.OK, complete.StatusCode);

    HttpResponseMessage emptyResponse = await Client.GetAsync(
      $"/public/{setup.CompanySlug}/{setup.LocationSlug}/now-serving"
    );
    using JsonDocument emptyJson = JsonDocument.Parse(
      await emptyResponse.Content.ReadAsStringAsync()
    );

    Assert.Equal(HttpStatusCode.OK, emptyResponse.StatusCode);
    Assert.Empty(emptyJson.RootElement.GetProperty("data").EnumerateArray());
  }

  [Fact]
  public async Task PublicNowServingSnapshotIncludesMultipleDesksServingSameQueue()
  {
    await CheckBackendIsRunning();
    StaffSetup setup = await CreateSetupAndStaff();
    int secondDeskId = await ReadId(await SendWithToken(
      HttpMethod.Post,
      "/desks/",
      setup.AdminToken,
      new { locationId = setup.LocationId, queueId = setup.QueueId, name = "second display desk" }
    ));
    string secondUsername = $"s2_{Guid.NewGuid():N}";
    HttpResponseMessage secondStaff = await CreateStaff(
      setup.AdminToken,
      setup.CompanyId,
      secondUsername
    );
    Assert.Equal(HttpStatusCode.Created, secondStaff.StatusCode);
    string secondToken = await Login(secondUsername, setup.StaffPassword);

    await StartSession(setup);
    HttpResponseMessage secondSession = await SendWithToken(
      HttpMethod.Post,
      "/staff-sessions/",
      secondToken,
      new { deskId = secondDeskId }
    );
    Assert.Equal(HttpStatusCode.Created, secondSession.StatusCode);

    await CreateTicket(setup.QueueId);
    await CreateTicket(setup.QueueId);
    await SendWithToken(HttpMethod.Post, "/tickets/next", setup.StaffToken);
    await SendWithToken(HttpMethod.Post, "/tickets/next", secondToken);

    HttpResponseMessage response = await Client.GetAsync(
      $"/public/{setup.CompanySlug}/{setup.LocationSlug}/now-serving"
    );
    using JsonDocument json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    Assert.Equal(2, json.RootElement.GetProperty("data").GetArrayLength());
  }

  [Fact]
  public async Task PublicNowServingSnapshotRemovesMissedTicketAndRestoresRecalledTicket()
  {
    await CheckBackendIsRunning();
    StaffSetup setup = await CreateSetupAndStaff();
    await StartSession(setup);
    int ticketId = await CreateTicket(setup.QueueId);
    await SendWithToken(HttpMethod.Post, "/tickets/next", setup.StaffToken);

    HttpResponseMessage missed = await SendWithToken(
      HttpMethod.Post,
      $"/tickets/{ticketId}/missed",
      setup.StaffToken
    );
    Assert.Equal(HttpStatusCode.OK, missed.StatusCode);

    string route = $"/public/{setup.CompanySlug}/{setup.LocationSlug}/now-serving";
    HttpResponseMessage empty = await Client.GetAsync(route);
    using JsonDocument emptyJson = JsonDocument.Parse(await empty.Content.ReadAsStringAsync());
    Assert.Empty(emptyJson.RootElement.GetProperty("data").EnumerateArray());

    HttpResponseMessage recall = await SendWithToken(
      HttpMethod.Post,
      $"/tickets/{ticketId}/recall",
      setup.StaffToken
    );
    Assert.Equal(HttpStatusCode.OK, recall.StatusCode);

    HttpResponseMessage serving = await Client.GetAsync(route);
    using JsonDocument servingJson = JsonDocument.Parse(await serving.Content.ReadAsStringAsync());
    Assert.Single(servingJson.RootElement.GetProperty("data").EnumerateArray());
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
  public async Task StaffServingTicketCanBeRecoveredFromMine()
  {
    await CheckBackendIsRunning();
    StaffSetup setup = await CreateSetupAndStaff();
    await StartSession(setup);
    int ticketId = await CreateTicket(setup.QueueId);

    HttpResponseMessage next = await SendWithToken(
      HttpMethod.Post,
      "/tickets/next",
      setup.StaffToken
    );
    Assert.Equal(HttpStatusCode.OK, next.StatusCode);

    HttpResponseMessage response = await SendWithToken(
      HttpMethod.Get,
      "/staff-sessions/mine/serving-ticket",
      setup.StaffToken
    );
    using JsonDocument json = JsonDocument.Parse(
      await response.Content.ReadAsStringAsync()
    );

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    Assert.Equal(
      ticketId,
      json.RootElement.GetProperty("data").GetProperty("id").GetInt32()
    );
  }

  [Fact]
  public async Task StaffServingTicketRecoveryReturnsNullWithoutSessionOrTicket()
  {
    await CheckBackendIsRunning();
    StaffSetup setup = await CreateSetupAndStaff();

    HttpResponseMessage response = await SendWithToken(
      HttpMethod.Get,
      "/staff-sessions/mine/serving-ticket",
      setup.StaffToken
    );
    using JsonDocument noSessionJson = JsonDocument.Parse(
      await response.Content.ReadAsStringAsync()
    );

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    Assert.Equal(JsonValueKind.Null, noSessionJson.RootElement.GetProperty("data").ValueKind);

    await StartSession(setup);
    response = await SendWithToken(
      HttpMethod.Get,
      "/staff-sessions/mine/serving-ticket",
      setup.StaffToken
    );
    using JsonDocument activeSessionJson = JsonDocument.Parse(
      await response.Content.ReadAsStringAsync()
    );

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    Assert.Equal(JsonValueKind.Null, activeSessionJson.RootElement.GetProperty("data").ValueKind);
  }

  [Fact]
  public async Task StaffServingTicketRecoveryReturnsNullAfterCompletion()
  {
    await CheckBackendIsRunning();
    StaffSetup setup = await CreateSetupAndStaff();
    await StartSession(setup);
    int ticketId = await CreateTicket(setup.QueueId);
    await SendWithToken(HttpMethod.Post, "/tickets/next", setup.StaffToken);

    HttpResponseMessage complete = await SendWithToken(
      HttpMethod.Post,
      $"/tickets/{ticketId}/complete",
      setup.StaffToken,
      new { completionResult = "SUCCESS" }
    );
    Assert.Equal(HttpStatusCode.OK, complete.StatusCode);

    HttpResponseMessage response = await SendWithToken(
      HttpMethod.Get,
      "/staff-sessions/mine/serving-ticket",
      setup.StaffToken
    );
    using JsonDocument json = JsonDocument.Parse(
      await response.Content.ReadAsStringAsync()
    );

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    Assert.Equal(JsonValueKind.Null, json.RootElement.GetProperty("data").ValueKind);
  }

  [Fact]
  public async Task StaffCanIdentifyTicketByPinAcrossQueuesInOwnLocation()
  {
    await CheckBackendIsRunning();
    StaffSetup setup = await CreateSetupAndStaff();
    await StartSession(setup);

    int otherQueueId = await ReadId(await SendWithToken(
      HttpMethod.Post,
      "/queues/",
      setup.AdminToken,
      new
      {
        locationId = setup.LocationId,
        name = $"other_staff_queue_{Guid.NewGuid():N}",
        description = "other queue",
        autoResetEnabled = false,
        resetAt = (string?)null
      }
    ));
    HttpResponseMessage ticketResponse = await Client.PostAsJsonAsync(
      "/tickets/",
      new { queueId = otherQueueId, email = (string?)null, serviceIds = (int[]?)null }
    );
    using JsonDocument ticketJson = JsonDocument.Parse(
      await ticketResponse.Content.ReadAsStringAsync()
    );
    string pin = ticketJson.RootElement.GetProperty("data").GetProperty("pin").GetString()!;

    HttpResponseMessage response = await SendWithToken(
      HttpMethod.Get,
      $"/tickets/identify-by-pin/{pin}",
      setup.StaffToken
    );

    using JsonDocument identificationJson = JsonDocument.Parse(
      await response.Content.ReadAsStringAsync()
    );
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    Assert.Equal(
      otherQueueId,
      identificationJson.RootElement.GetProperty("data").GetProperty("queueId").GetInt32()
    );
  }

  [Fact]
  public async Task StaffServingTicketRecoveryIsScopedToStaffAndDesk()
  {
    await CheckBackendIsRunning();
    StaffSetup setup = await CreateSetupAndStaff();
    int secondDeskId = await ReadId(await SendWithToken(
      HttpMethod.Post,
      "/desks/",
      setup.AdminToken,
      new
      {
        locationId = setup.LocationId,
        queueId = setup.QueueId,
        name = "second staff desk"
      }
    ));

    string secondStaffUsername = $"test_second_staff_{Guid.NewGuid():N}";
    HttpResponseMessage createSecondStaff = await CreateStaff(
      setup.AdminToken,
      setup.CompanyId,
      secondStaffUsername
    );
    Assert.Equal(HttpStatusCode.Created, createSecondStaff.StatusCode);
    string secondStaffToken = await Login(
      secondStaffUsername,
      setup.StaffPassword
    );

    await StartSession(setup);
    HttpResponseMessage secondSession = await SendWithToken(
      HttpMethod.Post,
      "/staff-sessions/",
      secondStaffToken,
      new { deskId = secondDeskId }
    );
    Assert.Equal(HttpStatusCode.Created, secondSession.StatusCode);

    await CreateTicket(setup.QueueId);
    await CreateTicket(setup.QueueId);
    await SendWithToken(HttpMethod.Post, "/tickets/next", setup.StaffToken);
    await SendWithToken(HttpMethod.Post, "/tickets/next", secondStaffToken);

    HttpResponseMessage firstResponse = await SendWithToken(
      HttpMethod.Get,
      "/staff-sessions/mine/serving-ticket",
      setup.StaffToken
    );
    HttpResponseMessage secondResponse = await SendWithToken(
      HttpMethod.Get,
      "/staff-sessions/mine/serving-ticket",
      secondStaffToken
    );
    using JsonDocument firstJson = JsonDocument.Parse(
      await firstResponse.Content.ReadAsStringAsync()
    );
    using JsonDocument secondJson = JsonDocument.Parse(
      await secondResponse.Content.ReadAsStringAsync()
    );

    Assert.Equal(HttpStatusCode.OK, firstResponse.StatusCode);
    Assert.Equal(HttpStatusCode.OK, secondResponse.StatusCode);
    Assert.NotEqual(
      firstJson.RootElement.GetProperty("data").GetProperty("id").GetInt32(),
      secondJson.RootElement.GetProperty("data").GetProperty("id").GetInt32()
    );
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
    string companyName = $"test_staff_company_{uniqueText}";
    string locationName = $"test_staff_location_{uniqueText}";
    int companyId = await ReadId(await SendWithToken(HttpMethod.Post, "/companies/", adminToken, new { name = companyName, missedTicketExpiryMinutes = 10, defaultEstimatedServiceMinutes = 5 }));
    int locationId = await ReadId(await SendWithToken(HttpMethod.Post, "/locations/", adminToken, new { companyId, name = locationName, address = "test address", country = "GR" }));
    int queueId = await ReadId(await SendWithToken(HttpMethod.Post, "/queues/", adminToken, new { locationId, name = $"test_staff_queue_{uniqueText}", description = "test queue", autoResetEnabled = false, resetAt = (string?)null }));
    int deskId = await ReadId(await SendWithToken(HttpMethod.Post, "/desks/", adminToken, new { locationId, queueId, name = $"test_staff_desk_{uniqueText}" }));
    return new StaffSetup { AdminToken = adminToken, CompanyId = companyId, LocationId = locationId, QueueId = queueId, DeskId = deskId, CompanySlug = Slugify(companyName), LocationSlug = Slugify(locationName), StaffUsername = $"test_staff_user_{uniqueText}", StaffPassword = "StaffUserPass1!" };
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

  private static async Task<int> CreateTicket(int queueId)
  {
    HttpResponseMessage response = await Client.PostAsJsonAsync(
      "/tickets/",
      new { queueId, email = (string?)null, serviceIds = (int[]?)null }
    );
    return await ReadId(response);
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

  private static string Slugify(string value)
  {
    return value.Replace('_', '-').ToLowerInvariant();
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
    public int LocationId { get; set; }
    public int QueueId { get; set; }
    public int DeskId { get; set; }
    public required string CompanySlug { get; set; }
    public required string LocationSlug { get; set; }
  }
}
