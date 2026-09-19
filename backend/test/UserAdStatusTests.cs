using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Data.Sqlite;
using Xunit;

namespace MyTurn.Backend.Tests;

public class UserAdStatusTests
{
  private static readonly HttpClient Client = new()
  {
    BaseAddress = new Uri("http://localhost:3020")
  };

  [Fact]
  public async Task MemberCanReadAndGrantOwnAdStatus()
  {
    LoginResult admin = await CreateAdmin();
    await CreateCompany(admin.Token);

    HttpResponseMessage read = await Send(
      HttpMethod.Get,
      "/company-users/mine/ad-status",
      admin.Token);
    Assert.Equal(HttpStatusCode.OK, read.StatusCode);
    Assert.Contains("hasPaid", await read.Content.ReadAsStringAsync());

    HttpResponseMessage grant = await Send(
      HttpMethod.Post,
      "/company-users/mine/ad-free",
      admin.Token);
    Assert.Equal(HttpStatusCode.OK, grant.StatusCode);
    using JsonDocument json = JsonDocument.Parse(
      await grant.Content.ReadAsStringAsync());
    DateTime adFreeUntil = json.RootElement.GetProperty("data")
      .GetProperty("adFreeUntil").GetDateTime();

    Assert.InRange(
      adFreeUntil,
      DateTime.UtcNow.AddHours(9).AddMinutes(59),
      DateTime.UtcNow.AddHours(10).AddMinutes(1));
  }

  [Fact]
  public async Task UserWithoutMembershipCannotReadOrGrantAdStatus()
  {
    LoginResult user = await CreateUser();

    HttpResponseMessage read = await Send(
      HttpMethod.Get,
      "/company-users/mine/ad-status",
      user.Token);
    HttpResponseMessage grant = await Send(
      HttpMethod.Post,
      "/company-users/mine/ad-free",
      user.Token);

    Assert.Equal(HttpStatusCode.Forbidden, read.StatusCode);
    Assert.Equal(HttpStatusCode.Forbidden, grant.StatusCode);
  }

  [Fact]
  public async Task MissingAuthenticationIsRejected()
  {
    HttpResponseMessage response = await Client.GetAsync(
      "/company-users/mine/ad-status");

    Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
  }

  [Fact]
  public async Task SuperAdminCanOverrideAdStatusWithoutChangingProfile()
  {
    LoginResult superAdmin = await CreateSuperAdmin();
    LoginResult target = await CreateUser();

    HttpResponseMessage update = await SendJson(
      HttpMethod.Put,
      $"/superadmin/users/{target.UserId}/ad-status",
      superAdmin.Token,
      new { hasPaid = true, adFreeUntil = (DateTime?)null });

    Assert.Equal(HttpStatusCode.OK, update.StatusCode);

    HttpResponseMessage profile = await Send(
      HttpMethod.Get,
      $"/users/{target.UserId}",
      superAdmin.Token);
    string profileBody = await profile.Content.ReadAsStringAsync();
    Assert.Contains(target.Username, profileBody);

    HttpResponseMessage nonSuperAdmin = await SendJson(
      HttpMethod.Put,
      $"/superadmin/users/{target.UserId}/ad-status",
      target.Token,
      new { hasPaid = false, adFreeUntil = DateTime.UtcNow });
    Assert.Equal(HttpStatusCode.Forbidden, nonSuperAdmin.StatusCode);
  }

  [Fact]
  public async Task SuperAdminCannotOverrideMissingUser()
  {
    LoginResult superAdmin = await CreateSuperAdmin();

    HttpResponseMessage response = await SendJson(
      HttpMethod.Put,
      "/superadmin/users/999999999/ad-status",
      superAdmin.Token,
      new { hasPaid = true, adFreeUntil = (DateTime?)null });

    Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
  }

  private static async Task<LoginResult> CreateAdmin()
  {
    string username = $"ad_status_admin_{Guid.NewGuid():N}"[..24];
    const string password = "AdStatusAdmin1!";
    HttpResponseMessage register = await Client.PostAsJsonAsync(
      "/auth/register-admin",
      new { username, name = username, email = $"{username}@example.com", password });
    Assert.Equal(HttpStatusCode.Created, register.StatusCode);
    return await Login(username, password);
  }

  private static async Task<LoginResult> CreateUser()
  {
    string username = $"ad_status_user_{Guid.NewGuid():N}"[..24];
    const string password = "AdStatusUser1!";
    HttpResponseMessage register = await Client.PostAsJsonAsync(
      "/auth/register-user",
      new { username, name = username, email = $"{username}@example.com", password });
    Assert.Equal(HttpStatusCode.Created, register.StatusCode);
    return await Login(username, password);
  }

  private static async Task<int> CreateCompany(string token)
  {
    HttpResponseMessage response = await SendJson(
      HttpMethod.Post,
      "/companies/",
      token,
      new
      {
        name = $"Ad Status Company {Guid.NewGuid():N}"[..24],
        missedTicketExpiryMinutes = 10,
        defaultEstimatedServiceMinutes = 5
      });
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    using JsonDocument json = JsonDocument.Parse(
      await response.Content.ReadAsStringAsync());
    return json.RootElement.GetProperty("data").GetProperty("id").GetInt32();
  }

  private static async Task<LoginResult> CreateSuperAdmin()
  {
    LoginResult admin = await CreateAdmin();
    await SetRole(admin.UserId, "SUPERADMIN");
    return await Login(admin.Username, admin.Password);
  }

  private static async Task<LoginResult> Login(string username, string password)
  {
    HttpResponseMessage response = await Client.PostAsJsonAsync(
      "/auth/login", new { username, password });
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    using JsonDocument json = JsonDocument.Parse(
      await response.Content.ReadAsStringAsync());
    JsonElement user = json.RootElement.GetProperty("data").GetProperty("user");
    return new LoginResult(
      json.RootElement.GetProperty("data").GetProperty("token").GetString()!,
      user.GetProperty("id").GetInt32(),
      username,
      password);
  }

  private static async Task<HttpResponseMessage> Send(
    HttpMethod method,
    string path,
    string token)
  {
    using HttpRequestMessage request = new(method, path);
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
    return await Client.SendAsync(request);
  }

  private static async Task<HttpResponseMessage> SendJson(
    HttpMethod method,
    string path,
    string token,
    object body)
  {
    using HttpRequestMessage request = new(method, path)
    {
      Content = JsonContent.Create(body)
    };
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
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

  private static string FindBackendDirectory()
  {
    var directory = new DirectoryInfo(AppContext.BaseDirectory);
    while (directory is not null &&
      !File.Exists(Path.Combine(directory.FullName, "backend.csproj")))
    {
      directory = directory.Parent;
    }

    return directory?.FullName
      ?? throw new InvalidOperationException("Backend directory not found.");
  }

  private sealed record LoginResult(
    string Token,
    int UserId,
    string Username,
    string Password);
}
