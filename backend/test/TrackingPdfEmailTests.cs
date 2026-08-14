using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;
using Xunit.Sdk;

namespace MyTurn.Backend.Tests;

public class TrackingPdfEmailTests
{
  private static readonly HttpClient Client = new HttpClient { BaseAddress = new Uri("http://localhost:3020") };

  [Fact]
  public async Task PublicTrackingWorksWithValidToken()
  {
    await CheckBackendIsRunning(); TrackingSetup setup = await CreateSetup(); TicketData ticket = await CreateTicket(setup.QueueId, null);
    HttpResponseMessage response = await Client.GetAsync($"/tickets/{ticket.TrackingToken}"); string text = await response.Content.ReadAsStringAsync(); using JsonDocument json = JsonDocument.Parse(text);
    Assert.Equal(HttpStatusCode.OK, response.StatusCode); Assert.True(json.RootElement.GetProperty("data").GetProperty("id").GetInt32() > 0); Assert.Equal("WAITING", json.RootElement.GetProperty("data").GetProperty("status").GetString());
  }

  [Fact]
  public async Task InvalidTrackingTokenReturnsNotFound()
  {
    await CheckBackendIsRunning(); HttpResponseMessage response = await Client.GetAsync("/tickets/test_tracking_invalid_token"); Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
  }

  [Fact]
  public async Task TicketPdfEndpointReturnsPdf()
  {
    await CheckBackendIsRunning(); TrackingSetup setup = await CreateSetup(); TicketData ticket = await CreateTicket(setup.QueueId, null);
    HttpResponseMessage response = await Client.GetAsync($"/tickets/{ticket.TrackingToken}/pdf"); byte[] bytes = await response.Content.ReadAsByteArrayAsync();
    Assert.Equal(HttpStatusCode.OK, response.StatusCode); Assert.Equal("application/pdf", response.Content.Headers.ContentType?.MediaType); Assert.NotEmpty(bytes);
  }

  [Fact]
  public async Task TicketCreationWithEmailSucceedsWhenEmailDeliveryFails()
  {
    await CheckBackendIsRunning(); TrackingSetup setup = await CreateSetup(); TicketData ticket = await CreateTicket(setup.QueueId, "test-tracking@example.invalid"); Assert.False(string.IsNullOrWhiteSpace(ticket.TrackingToken));
  }

  private static async Task<TrackingSetup> CreateSetup()
  {
    string unique = Guid.NewGuid().ToString("N").Substring(0, 8); string username = $"test_tracking_admin_{unique}"; string password = "TrackingAdmin1!"; Assert.Equal(HttpStatusCode.Created, (await Client.PostAsJsonAsync("/auth/register-admin", new { username, name = username, email = $"{username}@example.com", password })).StatusCode); string token = await Login(username, password);
    int company = await ReadId(await Send(HttpMethod.Post, "/companies/", token, new { name = $"test_tracking_company_{unique}", missedTicketExpiryMinutes = 10, defaultEstimatedServiceMinutes = 5 })); int location = await ReadId(await Send(HttpMethod.Post, "/locations/", token, new { companyId = company, name = $"test_tracking_location_{unique}", address = "test", country = "GR" })); int queue = await ReadId(await Send(HttpMethod.Post, "/queues/", token, new { locationId = location, name = $"test_tracking_queue_{unique}", description = "test", autoResetEnabled = false, resetAt = (string?)null })); return new TrackingSetup { AdminToken = token, QueueId = queue };
  }

  private static async Task<TicketData> CreateTicket(int queueId, string? email) { HttpResponseMessage response = await Client.PostAsJsonAsync("/tickets/", new { queueId, email, serviceIds = (int[]?)null }); string text = await response.Content.ReadAsStringAsync(); using JsonDocument json = JsonDocument.Parse(text); Assert.Equal(HttpStatusCode.Created, response.StatusCode); return new TicketData { TrackingToken = json.RootElement.GetProperty("data").GetProperty("trackingToken").GetString()! }; }
  private static async Task<string> Login(string username, string password) { HttpResponseMessage response = await Client.PostAsJsonAsync("/auth/login", new { username, password }); string text = await response.Content.ReadAsStringAsync(); using JsonDocument json = JsonDocument.Parse(text); Assert.Equal(HttpStatusCode.OK, response.StatusCode); return json.RootElement.GetProperty("data").GetProperty("token").GetString()!; }
  private static async Task<int> ReadId(HttpResponseMessage response) { string text = await response.Content.ReadAsStringAsync(); using JsonDocument json = JsonDocument.Parse(text); Assert.True((int)response.StatusCode >= 200 && (int)response.StatusCode < 300); return json.RootElement.GetProperty("data").GetProperty("id").GetInt32(); }
  private static async Task<HttpResponseMessage> Send(HttpMethod method, string route, string token, object? body = null) { HttpRequestMessage request = new HttpRequestMessage(method, route); request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token); if (body is not null) request.Content = JsonContent.Create(body); return await Client.SendAsync(request); }
  private static async Task CheckBackendIsRunning() { try { HttpResponseMessage response = await Client.GetAsync("/health"); if (response.StatusCode != HttpStatusCode.OK) throw new XunitException("Το backend δεν είναι διαθέσιμο. Ξεκινήστε το με: dotnet run --project backend/backend.csproj"); } catch (HttpRequestException) { throw new XunitException("Το backend δεν τρέχει στο http://localhost:3020. Ξεκινήστε το πρώτα με: dotnet run --project backend/backend.csproj"); } }
  private class TrackingSetup { public required string AdminToken { get; set; } public int QueueId { get; set; } }
  private class TicketData { public required string TrackingToken { get; set; } }
}
