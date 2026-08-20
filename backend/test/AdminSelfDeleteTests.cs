using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Data.Sqlite;
using Xunit;
using Xunit.Sdk;

namespace MyTurn.Backend.Tests;

public class AdminSelfDeleteTests
{
  private static readonly HttpClient Client = new()
  {
    BaseAddress = new Uri("http://localhost:3020")
  };

  [Fact]
  public async Task AdminCanDeleteOwnAccountWithCorrectPassword()
  {
    Scenario scenario = await CreateScenario(false);

    HttpResponseMessage response = await DeleteAdmin(
      scenario.AdminToken,
      scenario.AdminId,
      scenario.AdminPassword);

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    Assert.Equal(0, await CountRows("Users", scenario.AdminId));
    Assert.Equal(0, await CountRows("CompanyUsers", scenario.AdminId));
    Assert.Equal(0, await CountRows("Users", scenario.StaffId));
    Assert.Equal(0, await CountCompany(scenario.CompanyId));
  }

  [Fact]
  public async Task WrongPasswordIsRejected()
  {
    Scenario scenario = await CreateScenario(false);

    HttpResponseMessage response = await DeleteAdmin(
      scenario.AdminToken,
      scenario.AdminId,
      "WrongPassword1!");

    Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    Assert.Equal(1, await CountRows("Users", scenario.AdminId));
  }

  [Fact]
  public async Task AdminCannotTargetAnotherUser()
  {
    Scenario scenario = await CreateScenario(false);

    HttpResponseMessage response = await DeleteAdmin(
      scenario.AdminToken,
      scenario.StaffId,
      scenario.AdminPassword);

    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    Assert.Equal(1, await CountRows("Users", scenario.StaffId));
  }

  [Fact]
  public async Task SharedCompanyAdminCannotDeleteCompanies()
  {
    Scenario scenario = await CreateScenario(true);

    HttpResponseMessage response = await DeleteAdmin(
      scenario.AdminToken,
      scenario.AdminId,
      scenario.AdminPassword);

    Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    Assert.Equal(1, await CountRows("Users", scenario.AdminId));
    Assert.Equal(1, await CountRows("CompanyUsers", scenario.AdminId));
    Assert.Equal(1, await CountRows("Users", scenario.StaffId));
    Assert.Equal(1, await CountCompany(scenario.CompanyId));
  }

  [Fact]
  public async Task SharedStaffAccountSurvivesWhenItBelongsToAnotherCompany()
  {
    Scenario scenario = await CreateScenario(false);
    string otherAdminUsername = $"shared_admin_{Guid.NewGuid():N}"[..20];
    string otherAdminPassword = scenario.AdminPassword;

    await RegisterAdmin(otherAdminUsername, otherAdminPassword);
    LoginResult otherAdmin = await Login(otherAdminUsername, otherAdminPassword);
    int otherCompanyId = await CreateCompany(otherAdmin.Token);
    await AddMembershipDirectly(scenario.StaffId, otherCompanyId);

    HttpResponseMessage response = await DeleteAdmin(
      scenario.AdminToken,
      scenario.AdminId,
      scenario.AdminPassword);

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    Assert.Equal(1, await CountRows("Users", scenario.StaffId));
    Assert.Equal(0, await CountCompany(scenario.CompanyId));
    Assert.Equal(1, await CountCompany(otherCompanyId));
    Assert.Equal(1, await CountCompanyMembership(scenario.StaffId, otherCompanyId));
  }

  private static async Task<Scenario> CreateScenario(bool addSecondAdmin)
  {
    await CheckBackendIsRunning();

    string suffix = Guid.NewGuid().ToString("N")[..8];
    string adminUsername = $"self_delete_admin_{suffix}";
    string staffUsername = $"self_delete_staff_{suffix}";
    const string adminPassword = "SelfDeleteAdmin1!";
    const string staffPassword = "SelfDeleteStaff1!";

    await RegisterAdmin(adminUsername, adminPassword);
    LoginResult admin = await Login(adminUsername, adminPassword);
    string adminToken = admin.Token;
    int adminId = admin.UserId;
    int companyId = await CreateCompany(adminToken);
    int staffId = await CreateStaff(adminToken, companyId, staffUsername, staffPassword);

    if (addSecondAdmin)
    {
      string otherAdminUsername = $"self_delete_other_{suffix}";
      await RegisterAdmin(otherAdminUsername, adminPassword);
      LoginResult otherAdmin = await Login(
        otherAdminUsername,
        adminPassword);
      await AddMembershipDirectly(otherAdmin.UserId, companyId);

      return new Scenario(
        adminToken,
        adminId,
        companyId,
        staffId,
        adminPassword,
        otherAdmin.Token);
    }

    return new Scenario(adminToken, adminId, companyId, staffId, adminPassword, null);
  }

  private static async Task<HttpResponseMessage> DeleteAdmin(
    string token,
    int userId,
    string password)
  {
    HttpRequestMessage request = new(HttpMethod.Delete, $"/users/{userId}")
    {
      Content = JsonContent.Create(new { currentPassword = password })
    };
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
    return await Client.SendAsync(request);
  }

  private static async Task RegisterAdmin(string username, string password)
  {
    HttpResponseMessage response = await Client.PostAsJsonAsync(
      "/auth/register-admin",
      new { username, name = username, email = $"{username}@example.com", password });
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
  }

  private static async Task<LoginResult> Login(
    string username,
    string password)
  {
    HttpResponseMessage response = await Client.PostAsJsonAsync(
      "/auth/login",
      new { username, password });
    string body = await response.Content.ReadAsStringAsync();
    using JsonDocument json = JsonDocument.Parse(body);

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    JsonElement data = json.RootElement.GetProperty("data");
    return new LoginResult(
      data.GetProperty("token").GetString()!,
      data.GetProperty("user").GetProperty("id").GetInt32());
  }

  private static async Task<int> CreateCompany(string token)
  {
    HttpResponseMessage response = await SendWithToken(
      HttpMethod.Post,
      "/companies/",
      token,
      new { name = $"self_delete_company_{Guid.NewGuid():N}" });
    string body = await response.Content.ReadAsStringAsync();
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    using JsonDocument json = JsonDocument.Parse(body);
    return json.RootElement.GetProperty("data").GetProperty("id").GetInt32();
  }

  private static async Task<int> CreateStaff(
    string token,
    int companyId,
    string username,
    string password)
  {
    HttpResponseMessage response = await SendWithToken(
      HttpMethod.Post,
      $"/company-users/company/{companyId}/staff",
      token,
      new { username, name = username, email = $"{username}@example.com", password });
    string body = await response.Content.ReadAsStringAsync();
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    using JsonDocument json = JsonDocument.Parse(body);
    return json.RootElement.GetProperty("data").GetProperty("id").GetInt32();
  }

  private static async Task<HttpResponseMessage> SendWithToken(
    HttpMethod method,
    string path,
    string token,
    object? body = null)
  {
    HttpRequestMessage request = new(method, path);
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

    if (body is not null)
    {
      request.Content = JsonContent.Create(body);
    }

    return await Client.SendAsync(request);
  }

  private static async Task AddMembershipDirectly(int userId, int companyId)
  {
    string databasePath = Path.Combine(FindBackendDirectory(), "myturn.test.db");
    await using SqliteConnection connection = new($"Data Source={databasePath}");
    await connection.OpenAsync();
    await using SqliteCommand command = connection.CreateCommand();
    command.CommandText =
      "INSERT INTO CompanyUsers (UserId, CompanyId, CreatedAt) VALUES ($userId, $companyId, $createdAt)";
    command.Parameters.AddWithValue("$userId", userId);
    command.Parameters.AddWithValue("$companyId", companyId);
    command.Parameters.AddWithValue("$createdAt", DateTime.UtcNow);
    await command.ExecuteNonQueryAsync();
  }

  private static async Task<int> ReadId(HttpResponseMessage response)
  {
    string body = await response.Content.ReadAsStringAsync();
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    using JsonDocument json = JsonDocument.Parse(body);
    return json.RootElement.GetProperty("data").GetProperty("id").GetInt32();
  }

  private static async Task<int> CountRows(string table, int userId)
  {
    string databasePath = Path.Combine(FindBackendDirectory(), "myturn.test.db");
    await using SqliteConnection connection =
      new($"Data Source={databasePath}");
    await connection.OpenAsync();
    await using SqliteCommand command = connection.CreateCommand();
    command.CommandText = table == "Users"
      ? "SELECT COUNT(*) FROM Users WHERE Id = $id"
      : "SELECT COUNT(*) FROM CompanyUsers WHERE UserId = $id";
    command.Parameters.AddWithValue("$id", userId);
    return Convert.ToInt32(await command.ExecuteScalarAsync());
  }

  private static async Task<int> CountCompany(int companyId)
  {
    string databasePath = Path.Combine(FindBackendDirectory(), "myturn.test.db");
    await using SqliteConnection connection =
      new($"Data Source={databasePath}");
    await connection.OpenAsync();
    await using SqliteCommand command = connection.CreateCommand();
    command.CommandText = "SELECT COUNT(*) FROM Companies WHERE Id = $id";
    command.Parameters.AddWithValue("$id", companyId);
    return Convert.ToInt32(await command.ExecuteScalarAsync());
  }

  private static async Task<int> CountCompanyMembership(int userId, int companyId)
  {
    string databasePath = Path.Combine(FindBackendDirectory(), "myturn.test.db");
    await using SqliteConnection connection =
      new($"Data Source={databasePath}");
    await connection.OpenAsync();
    await using SqliteCommand command = connection.CreateCommand();
    command.CommandText =
      "SELECT COUNT(*) FROM CompanyUsers WHERE UserId = $userId AND CompanyId = $companyId";
    command.Parameters.AddWithValue("$userId", userId);
    command.Parameters.AddWithValue("$companyId", companyId);
    return Convert.ToInt32(await command.ExecuteScalarAsync());
  }

  private static async Task CheckBackendIsRunning()
  {
    HttpResponseMessage response = await Client.GetAsync("/health");

    if (response.StatusCode != HttpStatusCode.OK)
    {
      throw new XunitException("The backend is not healthy.");
    }
  }

  private static string FindBackendDirectory()
  {
    DirectoryInfo? directory = new(AppContext.BaseDirectory);

    while (directory is not null &&
           !File.Exists(Path.Combine(directory.FullName, "backend.csproj")))
    {
      directory = directory.Parent;
    }

    return directory?.FullName
      ?? throw new XunitException("Could not locate backend.csproj.");
  }

  private sealed record Scenario(
    string AdminToken,
    int AdminId,
    int CompanyId,
    int StaffId,
    string AdminPassword,
    string? OtherAdminToken);

  private sealed record LoginResult(string Token, int UserId);
}
