using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;
using Xunit.Sdk;

namespace MyTurn.Backend.Tests;

public class AuthRolesTests
{
  private static readonly HttpClient Client = new HttpClient
  {
    BaseAddress = new Uri("http://localhost:3020")
  };

  private static readonly string UniqueText = DateTime.UtcNow.Ticks.ToString();

  [Fact]
  public async Task AdminRegistrationWorks()
  {
    await CheckBackendIsRunning();

    string username = $"test_auth_admin_{UniqueText}";
    string password = "AdminPass1!";

    var requestBody = new
    {
      username,
      name = "Auth Test Admin",
      email = $"{username}@example.com",
      password
    };

    HttpResponseMessage response = await Client.PostAsJsonAsync("/auth/register-admin", requestBody);
    string responseText = await response.Content.ReadAsStringAsync();

    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    Assert.DoesNotContain("password", responseText, StringComparison.OrdinalIgnoreCase);
    Assert.DoesNotContain("hashedPassword", responseText, StringComparison.OrdinalIgnoreCase);
  }

  [Fact]
  public async Task UserRegistrationWorks()
  {
    await CheckBackendIsRunning();

    string username = $"test_auth_user_{UniqueText}";

    var requestBody = new
    {
      username,
      name = "Auth Test User",
      email = $"{username}@example.com",
      password = "UserPass1!"
    };

    HttpResponseMessage response = await Client.PostAsJsonAsync("/auth/register-user", requestBody);

    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
  }

  [Fact]
  public async Task LoginWorks()
  {
    await CheckBackendIsRunning();

    string username = $"test_auth_login_{UniqueText}";
    string password = "LoginPass1!";
    await RegisterUser(username, password);

    HttpResponseMessage response = await Client.PostAsJsonAsync("/auth/login", new { username, password });
    string responseText = await response.Content.ReadAsStringAsync();
    using JsonDocument json = JsonDocument.Parse(responseText);

    string? token = json.RootElement.GetProperty("data").GetProperty("token").GetString();

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    Assert.False(string.IsNullOrWhiteSpace(token));
  }

  [Fact]
  public async Task InvalidLoginIsRejected()
  {
    await CheckBackendIsRunning();

    string username = $"test_auth_invalid_login_{UniqueText}";
    await RegisterUser(username, "CorrectPass1!");

    HttpResponseMessage response = await Client.PostAsJsonAsync(
      "/auth/login",
      new { username, password = "WrongPass1!" });

    Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
  }

  [Fact]
  public async Task AnonymousProtectedRequestIsRejected()
  {
    await CheckBackendIsRunning();

    HttpResponseMessage response = await Client.GetAsync("/users/");

    Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
  }

  [Fact]
  public async Task UserCannotAccessAdminOnlyEndpoint()
  {
    await CheckBackendIsRunning();

    string username = $"test_auth_forbidden_{UniqueText}";
    string token = await RegisterAndLoginUser(username, "UserPass1!");

    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, "/users/");
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
    HttpResponseMessage response = await Client.SendAsync(request);

    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
  }

  [Fact]
  public async Task AdminCanAccessAdminOnlyEndpoint()
  {
    await CheckBackendIsRunning();

    string username = $"test_auth_allowed_{UniqueText}";
    string token = await RegisterAndLoginAdmin(username, "AdminPass1!");

    HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Get, "/users/");
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
    HttpResponseMessage response = await Client.SendAsync(request);

    Assert.NotEqual(HttpStatusCode.Unauthorized, response.StatusCode);
    Assert.NotEqual(HttpStatusCode.Forbidden, response.StatusCode);
  }

  private static async Task CheckBackendIsRunning()
  {
    try
    {
      HttpResponseMessage response = await Client.GetAsync("/health");
      if (response.StatusCode != HttpStatusCode.OK)
      {
        throw new XunitException("The backend is not healthy. Start it first with: dotnet run --project backend/backend.csproj");
      }
    }
    catch (HttpRequestException)
    {
      throw new XunitException("The backend is not running at http://localhost:3020. Start it first with: dotnet run --project backend/backend.csproj");
    }
  }

  private static async Task RegisterUser(string username, string password)
  {
    var requestBody = new
    {
      username,
      name = "Auth Test User",
      email = $"{username}@example.com",
      password
    };

    HttpResponseMessage response = await Client.PostAsJsonAsync("/auth/register-user", requestBody);
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
  }

  private static async Task<string> RegisterAndLoginUser(string username, string password)
  {
    await RegisterUser(username, password);
    return await LoginAndGetToken(username, password);
  }

  private static async Task<string> RegisterAndLoginAdmin(string username, string password)
  {
    var requestBody = new
    {
      username,
      name = "Auth Test Admin",
      email = $"{username}@example.com",
      password
    };

    HttpResponseMessage registerResponse = await Client.PostAsJsonAsync("/auth/register-admin", requestBody);
    Assert.Equal(HttpStatusCode.Created, registerResponse.StatusCode);
    return await LoginAndGetToken(username, password);
  }

  private static async Task<string> LoginAndGetToken(string username, string password)
  {
    HttpResponseMessage response = await Client.PostAsJsonAsync("/auth/login", new { username, password });
    string responseText = await response.Content.ReadAsStringAsync();
    using JsonDocument json = JsonDocument.Parse(responseText);

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    return json.RootElement.GetProperty("data").GetProperty("token").GetString()!;
  }
}
