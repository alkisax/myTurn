using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;
using Xunit.Sdk;

namespace MyTurn.Backend.Tests;

public class CompanySetupTests
{
  private static readonly HttpClient Client = new HttpClient
  {
    BaseAddress = new Uri("http://localhost:3020")
  };

  [Fact]
  public async Task AdminCanCreateCompany()
  {
    await CheckBackendIsRunning();
    string token = await CreateAdminAndLogin();

    HttpResponseMessage response = await CreateCompany(token);

    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
  }

  [Fact]
  public async Task AdminCanCreateLocationInsideCompany()
  {
    await CheckBackendIsRunning();
    SetupData setup = await CreateCompanyAndLogin();

    HttpResponseMessage response = await CreateLocation(setup.Token, setup.CompanyId);

    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
  }

  [Fact]
  public async Task AdminCanCreateQueueInsideLocation()
  {
    await CheckBackendIsRunning();
    SetupData setup = await CreateCompanyLocationQueueAndLogin();

    HttpResponseMessage response = await CreateQueue(setup.Token, setup.LocationId);

    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
  }

  [Fact]
  public async Task AdminCanCreateDeskInsideLocationAndQueue()
  {
    await CheckBackendIsRunning();
    SetupData setup = await CreateCompanyLocationQueueAndLogin();

    HttpResponseMessage response = await CreateDesk(setup.Token, setup.LocationId, setup.QueueId);

    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
  }

  [Fact]
  public async Task AdminCanCreateServiceInsideLocation()
  {
    await CheckBackendIsRunning();
    SetupData setup = await CreateCompanyLocationAndLogin();

    HttpResponseMessage response = await CreateService(setup.Token, setup.LocationId, setup.QueueId);

    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
  }

  [Fact]
  public async Task AdminCanGetCreatedSetupResources()
  {
    await CheckBackendIsRunning();
    SetupData setup = await CreateCompleteSetup();

    HttpResponseMessage companyResponse = await SendWithToken(HttpMethod.Get, $"/companies/{setup.CompanyId}", setup.Token);
    HttpResponseMessage locationResponse = await SendWithToken(HttpMethod.Get, $"/locations/{setup.LocationId}", setup.Token);
    HttpResponseMessage queueResponse = await SendWithToken(HttpMethod.Get, $"/queues/{setup.QueueId}", setup.Token);
    HttpResponseMessage deskResponse = await SendWithToken(HttpMethod.Get, $"/desks/{setup.DeskId}", setup.Token);
    HttpResponseMessage serviceResponse = await SendWithToken(HttpMethod.Get, $"/services/{setup.ServiceId}", setup.Token);

    Assert.Equal(HttpStatusCode.OK, companyResponse.StatusCode);
    Assert.Equal(HttpStatusCode.OK, locationResponse.StatusCode);
    Assert.Equal(HttpStatusCode.OK, queueResponse.StatusCode);
    Assert.Equal(HttpStatusCode.OK, deskResponse.StatusCode);
    Assert.Equal(HttpStatusCode.OK, serviceResponse.StatusCode);
  }

  private static async Task<SetupData> CreateCompleteSetup()
  {
    SetupData setup = await CreateCompanyLocationQueueAndLogin();
    setup.DeskId = await ReadId(await CreateDesk(setup.Token, setup.LocationId, setup.QueueId));
    setup.ServiceId = await ReadId(await CreateService(setup.Token, setup.LocationId, setup.QueueId));
    return setup;
  }

  private static async Task<SetupData> CreateCompanyLocationQueueAndLogin()
  {
    SetupData setup = await CreateCompanyLocationAndLogin();
    setup.QueueId = await ReadId(await CreateQueue(setup.Token, setup.LocationId));
    return setup;
  }

  private static async Task<SetupData> CreateCompanyLocationAndLogin()
  {
    SetupData setup = await CreateCompanyAndLogin();
    setup.LocationId = await ReadId(await CreateLocation(setup.Token, setup.CompanyId));
    return setup;
  }

  private static async Task<SetupData> CreateCompanyAndLogin()
  {
    string token = await CreateAdminAndLogin();
    int companyId = await ReadId(await CreateCompany(token));
    return new SetupData { Token = token, CompanyId = companyId };
  }

  private static async Task<string> CreateAdminAndLogin()
  {
    string uniqueText = Guid.NewGuid().ToString("N").Substring(0, 8);
    string username = $"test_setup_admin_{uniqueText}";
    string password = "SetupPass1!";
    var body = new { username, name = "test_setup_admin", email = $"{username}@example.com", password };
    HttpResponseMessage registerResponse = await Client.PostAsJsonAsync("/auth/register-admin", body);
    Assert.Equal(HttpStatusCode.Created, registerResponse.StatusCode);

    HttpResponseMessage loginResponse = await Client.PostAsJsonAsync("/auth/login", new { username, password });
    string responseText = await loginResponse.Content.ReadAsStringAsync();
    using JsonDocument json = JsonDocument.Parse(responseText);
    Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);
    return json.RootElement.GetProperty("data").GetProperty("token").GetString()!;
  }

  private static async Task<HttpResponseMessage> CreateCompany(string token)
  {
    var body = new { name = $"test_setup_company_{Guid.NewGuid():N}", missedTicketExpiryMinutes = 10, defaultEstimatedServiceMinutes = 5 };
    return await SendWithToken(HttpMethod.Post, "/companies/", token, body);
  }

  private static async Task<HttpResponseMessage> CreateLocation(string token, int companyId)
  {
    var body = new { companyId, name = $"test_setup_location_{Guid.NewGuid():N}", address = "test address", country = "GR" };
    return await SendWithToken(HttpMethod.Post, "/locations/", token, body);
  }

  private static async Task<HttpResponseMessage> CreateQueue(string token, int locationId)
  {
    var body = new { locationId, name = $"test_setup_queue_{Guid.NewGuid():N}", description = "test queue", autoResetEnabled = false, resetAt = (string?)null };
    return await SendWithToken(HttpMethod.Post, "/queues/", token, body);
  }

  private static async Task<HttpResponseMessage> CreateDesk(string token, int locationId, int queueId)
  {
    var body = new { locationId, queueId, name = $"test_setup_desk_{Guid.NewGuid():N}" };
    return await SendWithToken(HttpMethod.Post, "/desks/", token, body);
  }

  private static async Task<HttpResponseMessage> CreateService(string token, int locationId, int queueId)
  {
    var body = new { locationId, queueId, name = $"test_setup_service_{Guid.NewGuid():N}", description = "test service", isGeneric = false, estimatedServiceMinutes = 5 };
    return await SendWithToken(HttpMethod.Post, "/services/", token, body);
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

  private class SetupData
  {
    public required string Token { get; set; }
    public int CompanyId { get; set; }
    public int LocationId { get; set; }
    public int QueueId { get; set; }
    public int DeskId { get; set; }
    public int ServiceId { get; set; }
  }
}
