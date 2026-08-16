using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace MyTurn.Backend.Tests;

public class V1IssuanceTests
{
  private static readonly HttpClient Client = new() { BaseAddress = new Uri("http://localhost:3020") };

  [Fact]
  public async Task GreekSlugsAndRenamesRemainAsciiAndUnique()
  {
    var setup = await CreateSetup("GreekSlug", "Κατάστημα Πατησίων");
    Assert.Equal("katastima-patision", setup.LocationSlug);

    var duplicate = await Send(HttpMethod.Post, "/locations/", setup.Token,
      new { companyId = setup.CompanyId, name = "Κατάστημα Πατησίων" });
    var duplicateSlug = Data(duplicate).GetProperty("slug").GetString();
    Assert.Equal("katastima-patision-2", duplicateSlug);

    var companyUpdate = await Send(HttpMethod.Put, $"/companies/{setup.CompanyId}", setup.Token,
      new { name = "Αθήνα Κέντρο", missedTicketExpiryMinutes = 10, defaultEstimatedServiceMinutes = 5 });
    Assert.StartsWith("athina-kentro", Data(companyUpdate).GetProperty("slug").GetString());

    var locationUpdate = await Send(HttpMethod.Put, $"/locations/{setup.LocationId}", setup.Token,
      new { name = "Νέα Τοποθεσία" });
    Assert.Equal("nea-topothesia", Data(locationUpdate).GetProperty("slug").GetString());
  }

  [Fact]
  public async Task RemoteIssuanceHonorsQueueSettingForAnonymousAndUser()
  {
    var setup = await CreateSetup("RemoteIssuance", "Remote Location");
    await UpdateQueue(setup, false);

    Assert.Equal(HttpStatusCode.BadRequest, (await Client.PostAsJsonAsync("/tickets/", new { queueId = setup.QueueId })).StatusCode);
    var userToken = await RegisterAndLogin("remote_user", "/auth/register-user");
    Assert.Equal(HttpStatusCode.BadRequest, (await Send(HttpMethod.Post, "/tickets/", userToken, new { queueId = setup.QueueId })).StatusCode);
  }

  [Fact]
  public async Task AdminCanIssueKioskTicketWhenRemoteIssuanceIsDisabled()
  {
    var setup = await CreateSetup("KioskIssuance", "Kiosk Location");
    await UpdateQueue(setup, false);

    var response = await Send(HttpMethod.Post, "/tickets/kiosk", setup.Token, new { queueId = setup.QueueId });
    Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    var kioskTicketId = Data(response).GetProperty("id").GetInt32();

    var mine = await Send(HttpMethod.Get, "/tickets/mine", setup.Token);
    Assert.Equal(HttpStatusCode.OK, mine.StatusCode);
    using var mineJson = JsonDocument.Parse(await mine.Content.ReadAsStringAsync());
    Assert.DoesNotContain(
      mineJson.RootElement.GetProperty("data").EnumerateArray(),
      ticket => ticket.GetProperty("id").GetInt32() == kioskTicketId);
  }

  [Fact]
  public async Task AdminCannotIssueKioskTicketForAnotherCompany()
  {
    var owner = await CreateSetup("KioskOwner", "Owner Location");
    var other = await CreateSetup("KioskOther", "Other Location");
    var response = await Send(HttpMethod.Post, "/tickets/kiosk", owner.Token, new { queueId = other.QueueId });
    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
  }

  private static async Task<Setup> CreateSetup(string prefix, string locationName)
  {
    var unique = Guid.NewGuid().ToString("N")[..8];
    var username = $"{prefix}_{unique}";
    var token = await RegisterAndLogin(username);
    var company = await Send(HttpMethod.Post, "/companies/", token, new { name = $"My Turn {prefix} {unique}" });
    var companyData = Data(company);
    var companyId = companyData.GetProperty("id").GetInt32();
    var location = await Send(HttpMethod.Post, "/locations/", token, new { companyId, name = locationName });
    var locationData = Data(location);
    var queue = await Send(HttpMethod.Post, "/queues/", token, new { locationId = locationData.GetProperty("id").GetInt32(), name = $"Queue {unique}", autoResetEnabled = false });
    return new(token, companyId, locationData.GetProperty("id").GetInt32(), locationData.GetProperty("slug").GetString()!, Data(queue).GetProperty("id").GetInt32());
  }

  private static async Task UpdateQueue(Setup setup, bool remoteAllowed)
  {
    var response = await Send(HttpMethod.Put, $"/queues/{setup.QueueId}", setup.Token,
      new { isRemoteTicketingAllowed = remoteAllowed });
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
  }

  private static async Task<string> RegisterAndLogin(string prefix, string route = "/auth/register-admin")
  {
    var unique = Guid.NewGuid().ToString("N")[..8];
    var username = $"{prefix}_{unique}";
    var password = "V1IssuancePass1!";
    Assert.Equal(HttpStatusCode.Created, (await Client.PostAsJsonAsync(route, new { username, name = username, email = $"{username}@example.com", password })).StatusCode);
    var response = await Client.PostAsJsonAsync("/auth/login", new { username, password });
    return JsonDocument.Parse(await response.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("token").GetString()!;
  }

  private static async Task<HttpResponseMessage> Send(HttpMethod method, string path, string token, object? body = null)
  {
    using var request = new HttpRequestMessage(method, path);
    if (body is not null) request.Content = JsonContent.Create(body);
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
    return await Client.SendAsync(request);
  }

  private static JsonElement Data(HttpResponseMessage response)
  {
    response.EnsureSuccessStatusCode();
    return JsonDocument.Parse(response.Content.ReadAsStringAsync().GetAwaiter().GetResult()).RootElement.GetProperty("data");
  }

  private record Setup(string Token, int CompanyId, int LocationId, string LocationSlug, int QueueId);
}
