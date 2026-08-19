using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;
using Xunit.Sdk;

namespace MyTurn.Backend.Tests;

public class CompanyStaffEditTests
{
  private static readonly HttpClient Client = new HttpClient
  {
    BaseAddress = new Uri("http://localhost:3020")
  };

  [Fact]
  public async Task AdminCanEditStaffInOwnCompany()
  {
    await CheckBackendIsRunning();
    Scenario scenario = await CreateScenario();

    HttpResponseMessage response = await UpdateStaff(
      scenario.Admin.Token,
      scenario.CompanyId,
      scenario.StaffId,
      new { username = scenario.StaffUsername + "_edited", name = "Edited Staff" });

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
  }

  [Fact]
  public async Task AdminCanResetStaffPassword()
  {
    await CheckBackendIsRunning();
    Scenario scenario = await CreateScenario();
    const string newPassword = "ResetPass1!";

    HttpResponseMessage response = await UpdateStaff(
      scenario.Admin.Token,
      scenario.CompanyId,
      scenario.StaffId,
      new { username = scenario.StaffUsername, password = newPassword });

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    LoginData login = await Login(scenario.StaffUsername, newPassword);
    Assert.False(string.IsNullOrWhiteSpace(login.Token));
  }

  [Fact]
  public async Task OmittingPasswordPreservesCurrentPassword()
  {
    await CheckBackendIsRunning();
    Scenario scenario = await CreateScenario();

    HttpResponseMessage response = await UpdateStaff(
      scenario.Admin.Token,
      scenario.CompanyId,
      scenario.StaffId,
      new { username = scenario.StaffUsername, name = "Updated Name" });

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    LoginData login = await Login(scenario.StaffUsername, scenario.StaffPassword);
    Assert.False(string.IsNullOrWhiteSpace(login.Token));
  }

  [Fact]
  public async Task AdminCannotEditStaffFromAnotherCompany()
  {
    await CheckBackendIsRunning();
    Scenario scenario = await CreateScenario();

    HttpResponseMessage response = await UpdateStaff(
      scenario.Admin.Token,
      scenario.OtherCompanyId,
      scenario.StaffId,
      new { username = scenario.StaffUsername });

    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
  }

  [Fact]
  public async Task NonStaffTargetIsRejected()
  {
    await CheckBackendIsRunning();
    Scenario scenario = await CreateScenario();

    HttpResponseMessage response = await UpdateStaff(
      scenario.Admin.Token,
      scenario.CompanyId,
      scenario.Admin.Id,
      new { username = scenario.Admin.Username });

    Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
  }

  [Fact]
  public async Task StaffWithoutCompanyMembershipIsRejected()
  {
    await CheckBackendIsRunning();
    Scenario scenario = await CreateScenario();

    HttpResponseMessage response = await UpdateStaff(
      scenario.Admin.Token,
      scenario.CompanyId,
      scenario.OtherStaffId,
      new { username = scenario.OtherStaffUsername });

    Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
  }

  private static async Task<Scenario> CreateScenario()
  {
    string suffix = Guid.NewGuid().ToString("N")[..8];
    string adminUsername = $"test_staff_edit_admin_{suffix}";
    string otherAdminUsername = $"test_staff_edit_other_admin_{suffix}";
    string staffUsername = $"test_staff_edit_staff_{suffix}";
    string otherStaffUsername = $"test_staff_edit_other_staff_{suffix}";
    const string adminPassword = "AdminPass1!";
    const string staffPassword = "StaffPass1!";

    await RegisterAdmin(adminUsername, adminPassword);
    await RegisterAdmin(otherAdminUsername, adminPassword);

    LoginData admin = await Login(adminUsername, adminPassword);
    LoginData otherAdmin = await Login(otherAdminUsername, adminPassword);
    int companyId = await CreateCompany(admin.Token);
    int otherCompanyId = await CreateCompany(otherAdmin.Token);
    int staffId = await CreateStaff(admin.Token, companyId, staffUsername, staffPassword);
    int otherStaffId = await CreateStaff(otherAdmin.Token, otherCompanyId, otherStaffUsername, staffPassword);

    return new Scenario
    {
      Admin = admin with { Username = adminUsername },
      CompanyId = companyId,
      OtherCompanyId = otherCompanyId,
      StaffId = staffId,
      OtherStaffId = otherStaffId,
      StaffUsername = staffUsername,
      OtherStaffUsername = otherStaffUsername,
      StaffPassword = staffPassword
    };
  }

  private static async Task RegisterAdmin(string username, string password)
  {
    HttpResponseMessage response = await Client.PostAsJsonAsync(
      "/auth/register-admin",
      new { username, name = username, email = $"{username}@example.com", password });
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
  }

  private static async Task<LoginData> Login(string username, string password)
  {
    HttpResponseMessage response = await Client.PostAsJsonAsync(
      "/auth/login",
      new { username, password });
    string body = await response.Content.ReadAsStringAsync();
    using JsonDocument json = JsonDocument.Parse(body);
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);

    JsonElement data = json.RootElement.GetProperty("data");
    return new LoginData(
      data.GetProperty("token").GetString()!,
      data.GetProperty("user").GetProperty("id").GetInt32(),
      username);
  }

  private static async Task<int> CreateCompany(string token)
  {
    HttpResponseMessage response = await Send(
      HttpMethod.Post,
      "/companies/",
      token,
      new { name = $"test_staff_edit_company_{Guid.NewGuid():N}", missedTicketExpiryMinutes = 10, defaultEstimatedServiceMinutes = 5 });
    return await ReadId(response);
  }

  private static async Task<int> CreateStaff(string token, int companyId, string username, string password)
  {
    HttpResponseMessage response = await Send(
      HttpMethod.Post,
      $"/company-users/company/{companyId}/staff",
      token,
      new { username, name = username, email = $"{username}@example.com", password });
    return await ReadId(response);
  }

  private static async Task<HttpResponseMessage> UpdateStaff(
    string token,
    int companyId,
    int userId,
    object body)
  {
    return await Send(
      HttpMethod.Put,
      $"/company-users/company/{companyId}/staff/{userId}",
      token,
      body);
  }

  private static async Task<HttpResponseMessage> Send(
    HttpMethod method,
    string route,
    string token,
    object? body = null)
  {
    using HttpRequestMessage request = new HttpRequestMessage(method, route);
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

    if (body is not null)
    {
      request.Content = JsonContent.Create(body);
    }

    return await Client.SendAsync(request);
  }

  private static async Task<int> ReadId(HttpResponseMessage response)
  {
    string body = await response.Content.ReadAsStringAsync();
    using JsonDocument json = JsonDocument.Parse(body);
    Assert.True((int)response.StatusCode is >= 200 and < 300, body);
    return json.RootElement.GetProperty("data").GetProperty("id").GetInt32();
  }

  private static async Task CheckBackendIsRunning()
  {
    try
    {
      HttpResponseMessage response = await Client.GetAsync("/health");
      if (response.StatusCode != HttpStatusCode.OK)
      {
        throw new XunitException("The backend is not healthy.");
      }
    }
    catch (HttpRequestException)
    {
      throw new XunitException("The backend is not running at http://localhost:3020.");
    }
  }

  private sealed class Scenario
  {
    public required LoginData Admin { get; init; }
    public int CompanyId { get; init; }
    public int OtherCompanyId { get; init; }
    public int StaffId { get; init; }
    public int OtherStaffId { get; init; }
    public required string StaffUsername { get; init; }
    public required string OtherStaffUsername { get; init; }
    public required string StaffPassword { get; init; }
  }

  private record LoginData(string Token, int Id, string Username);
}
