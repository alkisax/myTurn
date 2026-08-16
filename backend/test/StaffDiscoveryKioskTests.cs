using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Data.Sqlite;
using Xunit;

namespace MyTurn.Backend.Tests;

public class StaffDiscoveryKioskTests
{
  private static readonly HttpClient Client = new() { BaseAddress = new Uri("http://localhost:3020") };

  [Fact]
  public async Task StaffCanReadDesksFromOwnCompany()
  {
    Scenario s = await CreateScenario();
    HttpResponseMessage response = await Send(HttpMethod.Get, $"/staff/companies/{s.CompanyId}/desks", s.StaffToken);
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    string text = await response.Content.ReadAsStringAsync();
    Assert.Contains(s.DeskName, text);
    Assert.Contains("locationName", text);
    Assert.Contains("queueName", text);
  }

  [Fact]
  public async Task StaffCannotReadAnotherCompanyDesks()
  {
    Scenario s = await CreateScenario();
    HttpResponseMessage response = await Send(HttpMethod.Get, $"/staff/companies/{s.OtherCompanyId}/desks", s.StaffToken);
    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
  }

  [Fact]
  public async Task UserCannotReadStaffDesks()
  {
    Scenario s = await CreateScenario();
    string token = await RegisterAndLogin($"test_discovery_user_{Guid.NewGuid():N}"[..30], "/auth/register-user", "UserPass1!");
    HttpResponseMessage response = await Send(HttpMethod.Get, $"/staff/companies/{s.CompanyId}/desks", token);
    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
  }

  [Fact]
  public async Task CorrectCompanyStaffCanCreateKioskTicket()
  {
    Scenario s = await CreateScenario();
    HttpResponseMessage response = await Kiosk(s.StaffToken, s.QueueId);
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
  }

  [Fact]
  public async Task StaffCannotCreateKioskTicketForAnotherCompany()
  {
    Scenario s = await CreateScenario();
    HttpResponseMessage response = await Kiosk(s.StaffToken, s.OtherQueueId);
    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
  }

  [Fact]
  public async Task UserCannotCreateKioskTicket()
  {
    Scenario s = await CreateScenario();
    string token = await RegisterAndLogin($"test_kiosk_user_{Guid.NewGuid():N}"[..30], "/auth/register-user", "UserPass1!");
    HttpResponseMessage response = await Kiosk(token, s.QueueId);
    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
  }

  [Fact]
  public async Task AdminCanStillCreateKioskTicket()
  {
    Scenario s = await CreateScenario();
    HttpResponseMessage response = await Kiosk(s.AdminToken, s.QueueId);
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
  }

  [Fact]
  public async Task KioskTicketHasNullUserId()
  {
    Scenario s = await CreateScenario();
    HttpResponseMessage response = await Kiosk(s.StaffToken, s.QueueId);
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    int ticketId = await ReadId(response);

    string backendDirectory = FindBackendDirectory();
    await using var connection = new SqliteConnection($"Data Source={Path.Combine(backendDirectory, "myturn.test.db")}");
    await connection.OpenAsync();
    await using var command = connection.CreateCommand();
    command.CommandText = "SELECT UserId FROM Tickets WHERE Id = $id";
    command.Parameters.AddWithValue("$id", ticketId);
    object? userId = await command.ExecuteScalarAsync();
    Assert.NotNull(userId);
    Assert.Equal(DBNull.Value, userId);
  }

  private static async Task<Scenario> CreateScenario()
  {
    string unique = Guid.NewGuid().ToString("N")[..8];
    string adminName = $"test_discovery_admin_{unique}";
    string password = "DiscoveryPass1!";
    await RegisterAndLogin(adminName, "/auth/register-admin", password);
    string adminToken = await Login(adminName, password);
    int companyId = await ReadId(await Send(HttpMethod.Post, "/companies/", adminToken, new { name = $"test_discovery_company_{unique}", missedTicketExpiryMinutes = 10, defaultEstimatedServiceMinutes = 5 }));
    int locationId = await ReadId(await Send(HttpMethod.Post, "/locations/", adminToken, new { companyId, name = $"test_discovery_location_{unique}", address = "test", country = "GR" }));
    int queueId = await ReadId(await Send(HttpMethod.Post, "/queues/", adminToken, new { locationId, name = $"test_discovery_queue_{unique}", description = "test", autoResetEnabled = false, resetAt = (string?)null }));
    string deskName = $"test_discovery_desk_{unique}";
    await ReadId(await Send(HttpMethod.Post, "/desks/", adminToken, new { locationId, queueId, name = deskName }));
    string staffName = $"test_discovery_staff_{unique}";
    HttpResponseMessage staffResponse = await Send(HttpMethod.Post, $"/company-users/company/{companyId}/staff", adminToken, new { username = staffName, name = staffName, email = $"{staffName}@example.com", password });
    Assert.Equal(HttpStatusCode.Created, staffResponse.StatusCode);
    string staffToken = await Login(staffName, password);

    string otherAdminName = $"test_discovery_other_{unique}";
    await RegisterAndLogin(otherAdminName, "/auth/register-admin", password);
    string otherToken = await Login(otherAdminName, password);
    int otherCompanyId = await ReadId(await Send(HttpMethod.Post, "/companies/", otherToken, new { name = $"test_discovery_other_company_{unique}", missedTicketExpiryMinutes = 10, defaultEstimatedServiceMinutes = 5 }));
    int otherLocationId = await ReadId(await Send(HttpMethod.Post, "/locations/", otherToken, new { companyId = otherCompanyId, name = $"test_discovery_other_location_{unique}", address = "test", country = "GR" }));
    int otherQueueId = await ReadId(await Send(HttpMethod.Post, "/queues/", otherToken, new { locationId = otherLocationId, name = $"test_discovery_other_queue_{unique}", description = "test", autoResetEnabled = false, resetAt = (string?)null }));
    return new Scenario(adminToken, staffToken, companyId, otherCompanyId, queueId, otherQueueId, deskName);
  }

  private static async Task<HttpResponseMessage> Kiosk(string token, int queueId) => await Send(HttpMethod.Post, "/tickets/kiosk", token, new { queueId, email = (string?)null, serviceIds = (int[]?)null });

  private static async Task<string> RegisterAndLogin(string username, string route, string password = "TestPass1!")
  {
    HttpResponseMessage register = await Client.PostAsJsonAsync(route, new { username, name = username, email = $"{username}@example.com", password });
    Assert.Equal(HttpStatusCode.Created, register.StatusCode);
    return await Login(username, password);
  }

  private static async Task<string> Login(string username, string password)
  {
    HttpResponseMessage response = await Client.PostAsJsonAsync("/auth/login", new { username, password });
    using JsonDocument json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    return json.RootElement.GetProperty("data").GetProperty("token").GetString()!;
  }

  private static async Task<HttpResponseMessage> Send(HttpMethod method, string route, string token, object? body = null)
  {
    using var request = new HttpRequestMessage(method, route);
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
    if (body is not null) request.Content = JsonContent.Create(body);
    return await Client.SendAsync(request);
  }

  private static async Task<int> ReadId(HttpResponseMessage response)
  {
    string text = await response.Content.ReadAsStringAsync();
    Assert.True((int)response.StatusCode is >= 200 and < 300, text);
    using JsonDocument json = JsonDocument.Parse(text);
    return json.RootElement.GetProperty("data").GetProperty("id").GetInt32();
  }

  private static string FindBackendDirectory()
  {
    DirectoryInfo? directory = new(AppContext.BaseDirectory);
    while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "backend.csproj"))) directory = directory.Parent;
    return directory!.FullName;
  }

  private record Scenario(string AdminToken, string StaffToken, int CompanyId, int OtherCompanyId, int QueueId, int OtherQueueId, string DeskName);
}
