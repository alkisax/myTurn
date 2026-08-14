using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;
using Xunit.Sdk;

namespace MyTurn.Backend.Tests;

public class EtaTests
{
  private static readonly HttpClient Client = new HttpClient { BaseAddress = new Uri("http://localhost:3020") };

  [Fact]
  public async Task WaitingTicketReturnsEstimatedWaitingTime()
  {
    await CheckBackendIsRunning(); EtaSetup setup = await CreateSetup(); TicketData ticket = await CreateTicket(setup.QueueId, null);
    double eta = await ReadEta(ticket.TrackingToken);
    Assert.True(eta >= 0);
  }

  [Fact]
  public async Task ActiveStaffSessionProducesNonNegativeEta()
  {
    await CheckBackendIsRunning(); EtaSetup setup = await CreateSetupWithStaff(); TicketData ticket = await CreateTicket(setup.QueueId, null);
    double eta = await ReadEta(ticket.TrackingToken);
    Assert.True(eta >= 0);
  }

  [Fact]
  public async Task LaterWaitingTicketDoesNotHaveLowerEta()
  {
    await CheckBackendIsRunning(); EtaSetup setup = await CreateSetup(); TicketData first = await CreateTicket(setup.QueueId, null); TicketData second = await CreateTicket(setup.QueueId, null);
    double firstEta = await ReadEta(first.TrackingToken); double secondEta = await ReadEta(second.TrackingToken);
    Assert.True(secondEta >= firstEta);
  }

  [Fact]
  public async Task LongerServiceDurationAffectsFollowingTicketEta()
  {
    await CheckBackendIsRunning(); EtaSetup setup = await CreateSetup();
    int longServiceId = await CreateService(setup.AdminToken, setup.LocationId, "test_eta_long_service", 20);
    int shortServiceId = await CreateService(setup.AdminToken, setup.LocationId, "test_eta_short_service", 2);
    TicketData longTicket = await CreateTicket(setup.QueueId, new[] { longServiceId });
    TicketData followingTicket = await CreateTicket(setup.QueueId, new[] { shortServiceId });
    double longEta = await ReadEta(longTicket.TrackingToken); double followingEta = await ReadEta(followingTicket.TrackingToken);
    Assert.True(longEta >= 0); Assert.True(followingEta >= longEta); Assert.True(followingEta >= 20);
  }

  private static async Task<EtaSetup> CreateSetupWithStaff()
  {
    EtaSetup setup = await CreateSetup(); string username = $"test_eta_staff_{Guid.NewGuid().ToString("N").Substring(0, 8)}"; string password = "EtaStaff1!";
    await Register(setup.AdminToken, setup.CompanyId, username, password); string staffToken = await Login(username, password);
    Assert.Equal(HttpStatusCode.Created, (await Send(HttpMethod.Post, "/staff-sessions/", staffToken, new { deskId = setup.DeskId })).StatusCode); setup.StaffToken = staffToken; return setup;
  }

  private static async Task<EtaSetup> CreateSetup()
  {
    string unique = Guid.NewGuid().ToString("N").Substring(0, 8); string username = $"test_eta_admin_{unique}"; string password = "EtaAdmin1!"; await RegisterAdmin(username, password); string token = await Login(username, password);
    int company = await ReadId(await Send(HttpMethod.Post, "/companies/", token, new { name = $"test_eta_company_{unique}", missedTicketExpiryMinutes = 10, defaultEstimatedServiceMinutes = 5 }));
    int location = await ReadId(await Send(HttpMethod.Post, "/locations/", token, new { companyId = company, name = $"test_eta_location_{unique}", address = "test", country = "GR" }));
    int queue = await ReadId(await Send(HttpMethod.Post, "/queues/", token, new { locationId = location, name = $"test_eta_queue_{unique}", description = "test", autoResetEnabled = false, resetAt = (string?)null }));
    int desk = await ReadId(await Send(HttpMethod.Post, "/desks/", token, new { locationId = location, queueId = queue, name = $"test_eta_desk_{unique}" }));
    return new EtaSetup { AdminToken = token, CompanyId = company, LocationId = location, QueueId = queue, DeskId = desk };
  }

  private static async Task RegisterAdmin(string username, string password) { Assert.Equal(HttpStatusCode.Created, (await Client.PostAsJsonAsync("/auth/register-admin", new { username, name = username, email = $"{username}@example.com", password })).StatusCode); }
  private static async Task Register(string adminToken, int companyId, string username, string password) { Assert.Equal(HttpStatusCode.Created, (await Send(HttpMethod.Post, $"/company-users/company/{companyId}/staff", adminToken, new { username, name = username, email = $"{username}@example.com", password })).StatusCode); }
  private static async Task<string> Login(string username, string password) { HttpResponseMessage response = await Client.PostAsJsonAsync("/auth/login", new { username, password }); string text = await response.Content.ReadAsStringAsync(); using JsonDocument json = JsonDocument.Parse(text); Assert.Equal(HttpStatusCode.OK, response.StatusCode); return json.RootElement.GetProperty("data").GetProperty("token").GetString()!; }
  private static async Task<int> CreateService(string token, int locationId, string name, int minutes) { return await ReadId(await Send(HttpMethod.Post, "/services/", token, new { locationId, name = $"{name}_{Guid.NewGuid():N}", description = "test", isGeneric = false, estimatedServiceMinutes = minutes })); }
  private static async Task<TicketData> CreateTicket(int queueId, int[]? serviceIds) { HttpResponseMessage response = await Client.PostAsJsonAsync("/tickets/", new { queueId, email = (string?)null, serviceIds }); string text = await response.Content.ReadAsStringAsync(); using JsonDocument json = JsonDocument.Parse(text); Assert.Equal(HttpStatusCode.Created, response.StatusCode); JsonElement data = json.RootElement.GetProperty("data"); return new TicketData { TrackingToken = data.GetProperty("trackingToken").GetString()! }; }
  private static async Task<double> ReadEta(string trackingToken) { HttpResponseMessage response = await Client.GetAsync($"/tickets/{trackingToken}"); string text = await response.Content.ReadAsStringAsync(); using JsonDocument json = JsonDocument.Parse(text); Assert.Equal(HttpStatusCode.OK, response.StatusCode); return json.RootElement.GetProperty("data").GetProperty("estimatedWaitingMinutes").GetDouble(); }
  private static async Task<int> ReadId(HttpResponseMessage response) { string text = await response.Content.ReadAsStringAsync(); using JsonDocument json = JsonDocument.Parse(text); Assert.True((int)response.StatusCode >= 200 && (int)response.StatusCode < 300); return json.RootElement.GetProperty("data").GetProperty("id").GetInt32(); }
  private static async Task<HttpResponseMessage> Send(HttpMethod method, string route, string token, object? body = null) { HttpRequestMessage request = new HttpRequestMessage(method, route); request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token); if (body is not null) request.Content = JsonContent.Create(body); return await Client.SendAsync(request); }
  private static async Task CheckBackendIsRunning() { try { HttpResponseMessage response = await Client.GetAsync("/health"); if (response.StatusCode != HttpStatusCode.OK) throw new XunitException("Το backend δεν είναι διαθέσιμο. Ξεκινήστε το με: dotnet run --project backend/backend.csproj"); } catch (HttpRequestException) { throw new XunitException("Το backend δεν τρέχει στο http://localhost:3020. Ξεκινήστε το πρώτα με: dotnet run --project backend/backend.csproj"); } }
  private class EtaSetup { public required string AdminToken { get; set; } public string StaffToken { get; set; } = ""; public int CompanyId { get; set; } public int LocationId { get; set; } public int QueueId { get; set; } public int DeskId { get; set; } }
  private class TicketData { public required string TrackingToken { get; set; } }
}
