using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Data.Sqlite;
using Xunit;

namespace MyTurn.Backend.Tests;

public class SuperAdminTests
{
  private static readonly HttpClient Client = new()
  {
    BaseAddress = new Uri("http://localhost:3020")
  };

  [Fact]
  public async Task SuperAdminCanReadGlobalEndpoints()
  {
    LoginResult superAdmin = await CreateSuperAdmin();
    LoginResult admin = await CreateAdmin();
    int companyId = await CreateCompany(admin.Token);

    HttpResponseMessage admins = await Send(
      HttpMethod.Get,
      "/superadmin/admins",
      superAdmin.Token);
    HttpResponseMessage companies = await Send(
      HttpMethod.Get,
      "/superadmin/companies",
      superAdmin.Token);
    HttpResponseMessage stats = await Send(
      HttpMethod.Get,
      "/superadmin/stats",
      superAdmin.Token);

    Assert.Equal(HttpStatusCode.OK, admins.StatusCode);
    Assert.Equal(HttpStatusCode.OK, companies.StatusCode);
    Assert.Equal(HttpStatusCode.OK, stats.StatusCode);

    string adminsBody = await admins.Content.ReadAsStringAsync();
    Assert.DoesNotContain("HashedPassword", adminsBody, StringComparison.OrdinalIgnoreCase);
    Assert.Contains("ADMIN", adminsBody);
    Assert.Contains(companyId.ToString(), await companies.Content.ReadAsStringAsync());
    Assert.Contains("companiesWithoutAdmin", await stats.Content.ReadAsStringAsync());
  }

  [Fact]
  public async Task SuperAdminCanDeleteAdminWithoutTargetPassword()
  {
    LoginResult superAdmin = await CreateSuperAdmin();
    LoginResult admin = await CreateAdmin();
    int companyId = await CreateCompany(admin.Token);

    HttpResponseMessage response = await Send(
      HttpMethod.Delete,
      $"/superadmin/admins/{admin.UserId}",
      superAdmin.Token);

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    Assert.Equal(0, await Count("Users", admin.UserId));
    Assert.Equal(0, await Count("Companies", companyId));
  }

  [Fact]
  public async Task SharedAdminCompanyBlocksSuperAdminDeletion()
  {
    LoginResult superAdmin = await CreateSuperAdmin();
    LoginResult admin = await CreateAdmin();
    LoginResult otherAdmin = await CreateAdmin();
    int companyId = await CreateCompany(admin.Token);
    await AddMembership(otherAdmin.UserId, companyId);

    HttpResponseMessage response = await Send(
      HttpMethod.Delete,
      $"/superadmin/admins/{admin.UserId}",
      superAdmin.Token);

    Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    Assert.Equal(1, await Count("Users", admin.UserId));
    Assert.Equal(1, await Count("Companies", companyId));
  }

  [Fact]
  public async Task NonSuperAdminCannotUseSuperAdminEndpoints()
  {
    LoginResult admin = await CreateAdmin();

    HttpResponseMessage response = await Send(
      HttpMethod.Get,
      "/superadmin/stats",
      admin.Token);

    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
  }

  private static async Task<LoginResult> CreateSuperAdmin()
  {
    LoginResult admin = await CreateAdmin();
    await SetRole(admin.UserId, "SUPERADMIN");
    return await Login(admin.Username, admin.Password);
  }

  private static async Task<LoginResult> CreateAdmin()
  {
    string username = $"superadmin_test_{Guid.NewGuid():N}"[..24];
    const string password = "SuperAdminTest1!";
    HttpResponseMessage register = await Client.PostAsJsonAsync(
      "/auth/register-admin",
      new { username, name = username, email = $"{username}@example.com", password });
    Assert.Equal(HttpStatusCode.Created, register.StatusCode);
    return await Login(username, password);
  }

  private static async Task<LoginResult> Login(string username, string password)
  {
    HttpResponseMessage response = await Client.PostAsJsonAsync(
      "/auth/login",
      new { username, password });
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    using JsonDocument json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
    JsonElement user = json.RootElement.GetProperty("data").GetProperty("user");
    return new LoginResult(
      json.RootElement.GetProperty("data").GetProperty("token").GetString()!,
      user.GetProperty("id").GetInt32(),
      username,
      password);
  }

  private static async Task<int> CreateCompany(string token)
  {
    HttpResponseMessage response = await Send(
      HttpMethod.Post,
      "/companies/",
      token,
      new { name = $"superadmin_company_{Guid.NewGuid():N}" });
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    using JsonDocument json = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
    return json.RootElement.GetProperty("data").GetProperty("id").GetInt32();
  }

  private static async Task<HttpResponseMessage> Send(
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

  private static async Task SetRole(int userId, string role)
  {
    string path = Path.Combine(FindBackendDirectory(), "myturn.test.db");
    await using SqliteConnection connection = new($"Data Source={path}");
    await connection.OpenAsync();
    await using SqliteCommand command = connection.CreateCommand();
    command.CommandText = "UPDATE Users SET Role = $role WHERE Id = $id";
    command.Parameters.AddWithValue("$role", role);
    command.Parameters.AddWithValue("$id", userId);
    await command.ExecuteNonQueryAsync();
  }

  private static async Task AddMembership(int userId, int companyId)
  {
    string path = Path.Combine(FindBackendDirectory(), "myturn.test.db");
    await using SqliteConnection connection = new($"Data Source={path}");
    await connection.OpenAsync();
    await using SqliteCommand command = connection.CreateCommand();
    command.CommandText =
      "INSERT INTO CompanyUsers (UserId, CompanyId, CreatedAt) VALUES ($userId, $companyId, $createdAt)";
    command.Parameters.AddWithValue("$userId", userId);
    command.Parameters.AddWithValue("$companyId", companyId);
    command.Parameters.AddWithValue("$createdAt", DateTime.UtcNow);
    await command.ExecuteNonQueryAsync();
  }

  private static async Task<int> Count(string table, int id)
  {
    string path = Path.Combine(FindBackendDirectory(), "myturn.test.db");
    await using SqliteConnection connection = new($"Data Source={path}");
    await connection.OpenAsync();
    await using SqliteCommand command = connection.CreateCommand();
    command.CommandText = $"SELECT COUNT(*) FROM {table} WHERE Id = $id";
    command.Parameters.AddWithValue("$id", id);
    return Convert.ToInt32(await command.ExecuteScalarAsync());
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
      ?? throw new InvalidOperationException("Could not locate backend.csproj.");
  }

  private sealed record LoginResult(
    string Token,
    int UserId,
    string Username,
    string Password);
}
