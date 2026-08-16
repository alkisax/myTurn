using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;
using Xunit.Sdk;

namespace MyTurn.Backend.Tests;

public class CompanyIsolationTests
{
  private static readonly HttpClient Client = new HttpClient
  {
    BaseAddress = new Uri("http://localhost:3020")
  };

  [Fact]
  public async Task AdminACannotGetCompanyB()
  {
    await CheckBackendIsRunning();
    IsolationScenario scenario = await CreateScenario();

    HttpResponseMessage response = await SendWithToken(
      HttpMethod.Get,
      $"/companies/{scenario.CompanyBId}",
      scenario.AdminAToken);

    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
  }

  [Fact]
  public async Task AdminACannotUpdateCompanyB()
  {
    await CheckBackendIsRunning();
    IsolationScenario scenario = await CreateScenario();

    var updateBody = new
    {
      name = "test_isolation_unchanged_attempt",
      missedTicketExpiryMinutes = 10,
      defaultEstimatedServiceMinutes = 5
    };

    HttpResponseMessage response = await SendWithToken(
      HttpMethod.Put,
      $"/companies/{scenario.CompanyBId}",
      scenario.AdminAToken,
      updateBody);

    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
  }

  [Fact]
  public async Task AdminACannotAccessCompanyBLocation()
  {
    await CheckBackendIsRunning();
    IsolationScenario scenario = await CreateScenario();
    int locationId = await CreateLocation(scenario.AdminBToken, scenario.CompanyBId);

    HttpResponseMessage response = await SendWithToken(
      HttpMethod.Get,
      $"/locations/{locationId}",
      scenario.AdminAToken);

    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
  }

  [Fact]
  public async Task AdminACannotAccessCompanyBQueue()
  {
    await CheckBackendIsRunning();
    IsolationScenario scenario = await CreateScenario();
    int locationId = await CreateLocation(scenario.AdminBToken, scenario.CompanyBId);
    int queueId = await CreateQueue(scenario.AdminBToken, locationId);

    HttpResponseMessage response = await SendWithToken(
      HttpMethod.Get,
      $"/queues/{queueId}",
      scenario.AdminAToken);

    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
  }

  [Fact]
  public async Task AdminACannotAccessCompanyBDesk()
  {
    await CheckBackendIsRunning();
    IsolationScenario scenario = await CreateScenario();
    int locationId = await CreateLocation(scenario.AdminBToken, scenario.CompanyBId);
    int queueId = await CreateQueue(scenario.AdminBToken, locationId);
    int deskId = await CreateDesk(scenario.AdminBToken, locationId, queueId);

    HttpResponseMessage response = await SendWithToken(
      HttpMethod.Get,
      $"/desks/{deskId}",
      scenario.AdminAToken);

    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
  }

  [Fact]
  public async Task AdminACannotAccessCompanyBService()
  {
    await CheckBackendIsRunning();
    IsolationScenario scenario = await CreateScenario();
    int locationId = await CreateLocation(scenario.AdminBToken, scenario.CompanyBId);
    int queueId = await CreateQueue(scenario.AdminBToken, locationId);
    int serviceId = await CreateService(scenario.AdminBToken, locationId, queueId);

    HttpResponseMessage response = await SendWithToken(
      HttpMethod.Get,
      $"/services/{serviceId}",
      scenario.AdminAToken);

    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
  }

  [Fact]
  public async Task AdminBCanAccessItsOwnCompanyAndLocation()
  {
    await CheckBackendIsRunning();
    IsolationScenario scenario = await CreateScenario();
    int locationId = await CreateLocation(scenario.AdminBToken, scenario.CompanyBId);

    HttpResponseMessage companyResponse = await SendWithToken(
      HttpMethod.Get,
      $"/companies/{scenario.CompanyBId}",
      scenario.AdminBToken);
    HttpResponseMessage locationResponse = await SendWithToken(
      HttpMethod.Get,
      $"/locations/{locationId}",
      scenario.AdminBToken);

    Assert.Equal(HttpStatusCode.OK, companyResponse.StatusCode);
    Assert.Equal(HttpStatusCode.OK, locationResponse.StatusCode);
  }

  private static async Task<IsolationScenario> CreateScenario()
  {
    string uniqueText = Guid.NewGuid().ToString("N").Substring(0, 8);
    string adminAUsername = $"test_isolation_admin_a_{uniqueText}";
    string adminBUsername = $"test_isolation_admin_b_{uniqueText}";
    string password = "IsolationPass1!";

    await RegisterAdmin(adminAUsername, password);
    await RegisterAdmin(adminBUsername, password);

    string adminAToken = await LoginAndGetToken(adminAUsername, password);
    string adminBToken = await LoginAndGetToken(adminBUsername, password);
    int companyAId = await CreateCompany(adminAToken, $"test_isolation_company_a_{uniqueText}");
    int companyBId = await CreateCompany(adminBToken, $"test_isolation_company_b_{uniqueText}");

    return new IsolationScenario
    {
      AdminAToken = adminAToken,
      AdminBToken = adminBToken,
      CompanyAId = companyAId,
      CompanyBId = companyBId
    };
  }

  private static async Task RegisterAdmin(string username, string password)
  {
    var body = new
    {
      username,
      name = "test_isolation_admin",
      email = $"{username}@example.com",
      password
    };

    HttpResponseMessage response = await Client.PostAsJsonAsync("/auth/register-admin", body);
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
  }

  private static async Task<string> LoginAndGetToken(string username, string password)
  {
    HttpResponseMessage response = await Client.PostAsJsonAsync(
      "/auth/login",
      new { username, password });
    string responseText = await response.Content.ReadAsStringAsync();
    using JsonDocument json = JsonDocument.Parse(responseText);

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    return json.RootElement.GetProperty("data").GetProperty("token").GetString()!;
  }

  private static async Task<int> CreateCompany(string token, string name)
  {
    var body = new
    {
      name,
      missedTicketExpiryMinutes = 10,
      defaultEstimatedServiceMinutes = 5
    };

    HttpResponseMessage response = await SendWithToken(HttpMethod.Post, "/companies/", token, body);
    int id = await ReadId(response);
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    return id;
  }

  private static async Task<int> CreateLocation(string token, int companyId)
  {
    var body = new
    {
      companyId,
      name = $"test_isolation_location_{Guid.NewGuid():N}",
      address = "test address",
      country = "GR"
    };

    HttpResponseMessage response = await SendWithToken(HttpMethod.Post, "/locations/", token, body);
    int id = await ReadId(response);
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    return id;
  }

  private static async Task<int> CreateQueue(string token, int locationId)
  {
    var body = new
    {
      locationId,
      name = $"test_isolation_queue_{Guid.NewGuid():N}",
      description = "test queue",
      autoResetEnabled = false,
      resetAt = (string?)null
    };

    HttpResponseMessage response = await SendWithToken(HttpMethod.Post, "/queues/", token, body);
    int id = await ReadId(response);
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    return id;
  }

  private static async Task<int> CreateDesk(string token, int locationId, int queueId)
  {
    var body = new
    {
      locationId,
      queueId,
      name = $"test_isolation_desk_{Guid.NewGuid():N}"
    };

    HttpResponseMessage response = await SendWithToken(HttpMethod.Post, "/desks/", token, body);
    int id = await ReadId(response);
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    return id;
  }

  private static async Task<int> CreateService(string token, int locationId, int queueId)
  {
    var body = new
    {
      locationId,
      queueId,
      name = $"test_isolation_service_{Guid.NewGuid():N}",
      description = "test service",
      isGeneric = false,
      estimatedServiceMinutes = 5
    };

    HttpResponseMessage response = await SendWithToken(HttpMethod.Post, "/services/", token, body);
    int id = await ReadId(response);
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    return id;
  }

  private static async Task<int> ReadId(HttpResponseMessage response)
  {
    string responseText = await response.Content.ReadAsStringAsync();
    using JsonDocument json = JsonDocument.Parse(responseText);
    return json.RootElement.GetProperty("data").GetProperty("id").GetInt32();
  }

  private static async Task<HttpResponseMessage> SendWithToken(
    HttpMethod method,
    string route,
    string token,
    object? body = null)
  {
    HttpRequestMessage request = new HttpRequestMessage(method, route);
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

    if (body is not null)
    {
      request.Content = JsonContent.Create(body);
    }

    return await Client.SendAsync(request);
  }

  private static async Task CheckBackendIsRunning()
  {
    try
    {
      HttpResponseMessage response = await Client.GetAsync("/health");
      if (response.StatusCode != HttpStatusCode.OK)
      {
        throw new XunitException("Το backend δεν είναι healthy. Ξεκινήστε το με: dotnet run --project backend/backend.csproj");
      }
    }
    catch (HttpRequestException)
    {
      throw new XunitException("Το backend δεν τρέχει στο http://localhost:3020. Ξεκινήστε το πρώτα με: dotnet run --project backend/backend.csproj");
    }
  }

  private class IsolationScenario
  {
    public required string AdminAToken { get; set; }
    public required string AdminBToken { get; set; }
    public int CompanyAId { get; set; }
    public int CompanyBId { get; set; }
  }
}
