using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;

namespace MyTurn.Backend.Tests;

public class PublicReadApiTests
{
  private static readonly HttpClient Client = new() { BaseAddress = new Uri("http://localhost:3020") };

  [Fact]
  public async Task PublicReadsResolveOnlyTheRequestedCompanyAndLocation()
  {
    var first = await CreateSetup("public_read");
    var second = await CreateSetup("public_read_other");

    Assert.Equal(HttpStatusCode.OK, (await Client.GetAsync($"/public/{first.CompanySlug}")).StatusCode);
    Assert.Equal(HttpStatusCode.OK, (await Client.GetAsync($"/public/{first.CompanySlug}/locations")).StatusCode);
    Assert.Equal(HttpStatusCode.OK, (await Client.GetAsync($"/public/{first.CompanySlug}/{first.LocationSlug}")).StatusCode);

    var queues = await Client.GetFromJsonAsync<JsonElement>($"/public/{first.CompanySlug}/{first.LocationSlug}/queues");
    var services = await Client.GetFromJsonAsync<JsonElement>($"/public/{first.CompanySlug}/{first.LocationSlug}/services");
    Assert.Contains(queues.GetProperty("data").EnumerateArray(), item => item.GetProperty("id").GetInt32() == first.QueueId);
    Assert.Contains(services.GetProperty("data").EnumerateArray(), item => item.GetProperty("id").GetInt32() == first.ServiceId);
    var queueServices = await Client.GetFromJsonAsync<JsonElement>($"/public/{first.CompanySlug}/{first.LocationSlug}/queues/{first.QueueId}/services");
    Assert.Contains(queueServices.GetProperty("data").EnumerateArray(), item => item.GetProperty("id").GetInt32() == first.ServiceId);
    Assert.DoesNotContain(queueServices.GetProperty("data").EnumerateArray(), item => item.GetProperty("id").GetInt32() == first.OtherServiceId);

    Assert.Equal(HttpStatusCode.NotFound, (await Client.GetAsync($"/public/{first.CompanySlug}/{second.LocationSlug}")).StatusCode);
  }

  [Fact]
  public async Task PublicReadReturnsNotFoundForUnknownSlugs()
  {
    Assert.Equal(HttpStatusCode.NotFound, (await Client.GetAsync("/public/does-not-exist")).StatusCode);
    Assert.Equal(HttpStatusCode.NotFound, (await Client.GetAsync("/public/does-not-exist/also-missing")).StatusCode);
  }

  private static async Task<Setup> CreateSetup(string prefix)
  {
    var unique = Guid.NewGuid().ToString("N")[..8];
    var username = $"{prefix}_{unique}";
    var password = "PublicReadPass1!";
    Assert.Equal(HttpStatusCode.Created, (await Client.PostAsJsonAsync("/auth/register-admin", new
    {
      username, name = username, email = $"{username}@example.com", password
    })).StatusCode);
    var login = await Client.PostAsJsonAsync("/auth/login", new { username, password });
    var token = JsonDocument.Parse(await login.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("token").GetString()!;

    var company = await Send(HttpMethod.Post, "/companies/", token, new { name = $"Public Read Company {unique}" });
    var companyJson = JsonDocument.Parse(await company.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
    var companyId = companyJson.GetProperty("id").GetInt32();
    var companySlug = companyJson.GetProperty("slug").GetString()!;

    var location = await Send(HttpMethod.Post, "/locations/", token, new { companyId, name = $"Public Read Location {unique}", address = "test", country = "GR" });
    var locationJson = JsonDocument.Parse(await location.Content.ReadAsStringAsync()).RootElement.GetProperty("data");
    var locationId = locationJson.GetProperty("id").GetInt32();
    var locationSlug = locationJson.GetProperty("slug").GetString()!;

    var queue = await Send(HttpMethod.Post, "/queues/", token, new { locationId, name = $"Public Queue {unique}", description = "queue", autoResetEnabled = false });
    var queueId = JsonDocument.Parse(await queue.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("id").GetInt32();
    var service = await Send(HttpMethod.Post, "/services/", token, new { locationId, queueId, name = $"Public Service {unique}", description = "service", estimatedServiceMinutes = 5 });
    var serviceId = JsonDocument.Parse(await service.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("id").GetInt32();
    var otherQueue = await Send(HttpMethod.Post, "/queues/", token, new { locationId, name = $"Other Public Queue {unique}", description = "queue", autoResetEnabled = false });
    var otherQueueId = JsonDocument.Parse(await otherQueue.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("id").GetInt32();
    var otherService = await Send(HttpMethod.Post, "/services/", token, new { locationId, queueId = otherQueueId, name = $"Other Public Service {unique}", description = "service", estimatedServiceMinutes = 5 });
    var otherServiceId = JsonDocument.Parse(await otherService.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("id").GetInt32();
    return new(companySlug, locationSlug, queueId, serviceId, otherServiceId);
  }

  private static async Task<HttpResponseMessage> Send(HttpMethod method, string path, string token, object body)
  {
    using var request = new HttpRequestMessage(method, path) { Content = JsonContent.Create(body) };
    request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
    return await Client.SendAsync(request);
  }

  private record Setup(string CompanySlug, string LocationSlug, int QueueId, int ServiceId, int OtherServiceId);
}
