using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;
using Xunit.Sdk;

namespace MyTurn.Backend.Tests;

public class AnalyticsTests
{
  private static readonly HttpClient Client = new() { BaseAddress = new Uri("http://localhost:3020") };
  [Fact] public async Task AdminCanReadOverview() { await Check(); Setup a = await SetupCompany("test_analytics_"); HttpResponseMessage r = await Send(HttpMethod.Get, $"/analytics/company/{a.CompanyId}/overview", a.Token); Assert.Equal(HttpStatusCode.OK, r.StatusCode); }
  [Fact] public async Task OverviewHasNonNegativeCounts() { await Check(); Setup a = await SetupCompany("test_analytics_counts_"); string t = await (await Send(HttpMethod.Get, $"/analytics/company/{a.CompanyId}/overview", a.Token)).Content.ReadAsStringAsync(); using JsonDocument j = JsonDocument.Parse(t); foreach (JsonProperty p in j.RootElement.GetProperty("data").EnumerateObject()) if (p.Value.ValueKind == JsonValueKind.Number) Assert.True(p.Value.GetDouble() >= 0, p.Name); }
  [Fact] public async Task TicketsByQueueWorks() { await Check(); Setup a = await SetupCompany("test_analytics_queue_"); HttpResponseMessage r = await Send(HttpMethod.Get, $"/analytics/company/{a.CompanyId}/tickets-by-queue", a.Token); Assert.Equal(HttpStatusCode.OK, r.StatusCode); }
  [Fact] public async Task OtherAdminCannotReadCompanyAnalytics() { await Check(); Setup a = await SetupCompany("test_analytics_a_"); Setup b = await SetupCompany("test_analytics_b_"); HttpResponseMessage r = await Send(HttpMethod.Get, $"/analytics/company/{b.CompanyId}/overview", a.Token); Assert.Equal(HttpStatusCode.Forbidden, r.StatusCode); }
  private static async Task<Setup> SetupCompany(string p) { string u = p + Guid.NewGuid().ToString("N")[..8]; await Register(u); string token = await Login(u); int c = await Id(await Send(HttpMethod.Post, "/companies/", token, new { name = u, defaultEstimatedServiceMinutes = 5 })); int l = await Id(await Send(HttpMethod.Post, "/locations/", token, new { companyId = c, name = u, address = "test", country = "GR" })); int q = await Id(await Send(HttpMethod.Post, "/queues/", token, new { locationId = l, name = u, description = "test", autoResetEnabled = false, resetAt = (string?)null })); return new(token, c, l, q); }
  private static async Task Register(string u) => Assert.Equal(HttpStatusCode.Created, (await Client.PostAsJsonAsync("/auth/register-admin", new { username = u, name = u, email = u + "@example.com", password = "Pass1!word" })).StatusCode);
  private static async Task<string> Login(string u) { HttpResponseMessage r = await Client.PostAsJsonAsync("/auth/login", new { username = u, password = "Pass1!word" }); string t = await r.Content.ReadAsStringAsync(); Assert.Equal(HttpStatusCode.OK, r.StatusCode); return JsonDocument.Parse(t).RootElement.GetProperty("data").GetProperty("token").GetString()!; }
  private static async Task<int> Id(HttpResponseMessage r) { string t = await r.Content.ReadAsStringAsync(); Assert.True((int)r.StatusCode is >= 200 and < 300, t); return JsonDocument.Parse(t).RootElement.GetProperty("data").GetProperty("id").GetInt32(); }
  private static async Task<HttpResponseMessage> Send(HttpMethod m, string p, string? token = null, object? body = null) { HttpRequestMessage r = new(m, p); if (token != null) r.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token); if (body != null) r.Content = JsonContent.Create(body); return await Client.SendAsync(r); }
  private static async Task Check() { try { Assert.Equal(HttpStatusCode.OK, (await Client.GetAsync("/health")).StatusCode); } catch (HttpRequestException) { throw new XunitException("Backend must be started at http://localhost:3020 before running tests."); } }
  private record Setup(string Token, int CompanyId, int LocationId, int QueueId);
}
