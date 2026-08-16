using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;
using Xunit.Sdk;

namespace MyTurn.Backend.Tests;

public class HappyPathTests
{
  private static readonly HttpClient Client = new() { BaseAddress = new Uri("http://localhost:3020") };

  [Fact]
  public async Task CompleteBusinessFlowFromSetupToHistory()
  {
    await CheckBackend(); string unique = Guid.NewGuid().ToString("N")[..8]; string password = "HappyPathPass1!"; string admin = "test_happypath_admin_" + unique;
    await Register(admin, password, "/auth/register-admin"); string adminToken = await Login(admin, password);
    int company = await Id(await Send(HttpMethod.Post, "/companies/", adminToken, new { name = "test_happypath_company_" + unique, defaultEstimatedServiceMinutes = 5 }));
    int location = await Id(await Send(HttpMethod.Post, "/locations/", adminToken, new { companyId = company, name = "test_happypath_location_" + unique, address = "test", country = "GR" }));
    int queue = await Id(await Send(HttpMethod.Post, "/queues/", adminToken, new { locationId = location, name = "test_happypath_queue_" + unique, description = "test", autoResetEnabled = false, resetAt = (string?)null }));
    int desk = await Id(await Send(HttpMethod.Post, "/desks/", adminToken, new { locationId = location, queueId = queue, name = "test_happypath_desk_" + unique }));
    int service = await Id(await Send(HttpMethod.Post, "/services/", adminToken, new { locationId = location, queueId = queue, name = "test_happypath_service_" + unique, description = "test", isGeneric = false, estimatedServiceMinutes = 5 }));
    string staff = "test_happypath_staff_" + unique; await Send(HttpMethod.Post, $"/company-users/company/{company}/staff", adminToken, new { username = staff, name = staff, email = staff + "@example.com", password }); string staffToken = await Login(staff, password);
    Assert.Equal(HttpStatusCode.Created, (await Send(HttpMethod.Post, "/staff-sessions/", staffToken, new { deskId = desk })).StatusCode);
    string ticketText = await (await Client.PostAsJsonAsync("/tickets/", new { queueId = queue, email = (string?)null, serviceIds = new[] { service } })).Content.ReadAsStringAsync(); using JsonDocument ticketJson = JsonDocument.Parse(ticketText); JsonElement ticket = ticketJson.RootElement.GetProperty("data"); int ticketId = ticket.GetProperty("id").GetInt32(); Assert.Equal("WAITING", ticket.GetProperty("status").GetString());
    HttpResponseMessage next = await Send(HttpMethod.Post, "/tickets/next", staffToken); Assert.Equal(HttpStatusCode.OK, next.StatusCode); Assert.Equal("SERVING", JsonDocument.Parse(await next.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("status").GetString());
    HttpResponseMessage complete = await Send(HttpMethod.Post, $"/tickets/{ticketId}/complete", staffToken, new { completionResult = "SUCCESS" }); Assert.Equal(HttpStatusCode.OK, complete.StatusCode); Assert.Equal("COMPLETED", JsonDocument.Parse(await complete.Content.ReadAsStringAsync()).RootElement.GetProperty("data").GetProperty("status").GetString());
    HttpResponseMessage history = await Send(HttpMethod.Get, $"/tickets/queue/{queue}/history", adminToken); Assert.Equal(HttpStatusCode.OK, history.StatusCode); string historyText = await history.Content.ReadAsStringAsync(); Assert.Contains("COMPLETED", historyText);
  }
  private static async Task Register(string u, string p, string route) => Assert.Equal(HttpStatusCode.Created, (await Client.PostAsJsonAsync(route, new { username = u, name = u, email = u + "@example.com", password = p })).StatusCode);
  private static async Task<string> Login(string u, string p) { HttpResponseMessage r = await Client.PostAsJsonAsync("/auth/login", new { username = u, password = p }); string text = await r.Content.ReadAsStringAsync(); Assert.Equal(HttpStatusCode.OK, r.StatusCode); return JsonDocument.Parse(text).RootElement.GetProperty("data").GetProperty("token").GetString()!; }
  private static async Task<int> Id(HttpResponseMessage r) { string text = await r.Content.ReadAsStringAsync(); Assert.True((int)r.StatusCode is >= 200 and < 300, text); return JsonDocument.Parse(text).RootElement.GetProperty("data").GetProperty("id").GetInt32(); }
  private static async Task<HttpResponseMessage> Send(HttpMethod m, string path, string? token = null, object? body = null) { HttpRequestMessage r = new(m, path); if (token != null) r.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token); if (body != null) r.Content = JsonContent.Create(body); return await Client.SendAsync(r); }
  private static async Task CheckBackend() { try { Assert.Equal(HttpStatusCode.OK, (await Client.GetAsync("/health")).StatusCode); } catch (HttpRequestException) { throw new XunitException("Backend must be started at http://localhost:3020 before running tests."); } }
}
