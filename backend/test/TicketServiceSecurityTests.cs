using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;
using Xunit.Sdk;

namespace MyTurn.Backend.Tests;

public class TicketServiceSecurityTests
{
  private static readonly HttpClient Client = new() { BaseAddress = new Uri("http://localhost:3020") };

  [Fact]
  public async Task AdminCanUseTicketServiceFromOwnCompany()
  {
    await CheckBackend(); Setup a = await CreateSetup("test_ticketservice_a_");
    int ticketId = await CreateTicket(a.QueueId); int serviceId = await CreateService(a);
    HttpResponseMessage response = await Send(HttpMethod.Post, $"/ticket-services/{ticketId}/{serviceId}", a.Token);
    Assert.Equal(HttpStatusCode.OK, response.StatusCode);
  }

  [Fact]
  public async Task AdminCannotAccessTicketServiceFromOtherCompany()
  {
    await CheckBackend(); Setup a = await CreateSetup("test_ticketservice_a_"); Setup b = await CreateSetup("test_ticketservice_b_");
    int ticketId = await CreateTicket(b.QueueId); HttpResponseMessage response = await Send(HttpMethod.Get, $"/ticket-services/ticket/{ticketId}", a.Token);
    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
  }

  [Fact]
  public async Task StaffCannotUseAdminOnlyTicketServiceEndpoint()
  {
    await CheckBackend(); Setup a = await CreateSetup("test_ticketservice_staff_"); string staffToken = await CreateStaffAndLogin(a);
    HttpResponseMessage response = await Send(HttpMethod.Get, $"/ticket-services/ticket/999999999", staffToken);
    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
  }

  [Fact]
  public async Task UserCannotUseAdminOnlyTicketServiceEndpoint()
  {
    await CheckBackend(); Setup a = await CreateSetup("test_ticketservice_user_"); string userToken = await RegisterAndLogin("test_ticketservice_user_" + Guid.NewGuid().ToString("N")[..8]);
    HttpResponseMessage response = await Send(HttpMethod.Get, "/ticket-services/ticket/999999999", userToken);
    Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
  }

  private static async Task<Setup> CreateSetup(string prefix)
  { string u = prefix + Guid.NewGuid().ToString("N")[..8]; await Register(u, "Pass1!word", "/auth/register-admin"); string token = await Login(u, "Pass1!word"); int company = await Id(await Send(HttpMethod.Post, "/companies/", token, new { name = u, defaultEstimatedServiceMinutes = 5 })); int location = await Id(await Send(HttpMethod.Post, "/locations/", token, new { companyId = company, name = u, address = "test", country = "GR" })); int queue = await Id(await Send(HttpMethod.Post, "/queues/", token, new { locationId = location, name = u, description = "test", autoResetEnabled = false, resetAt = (string?)null })); return new Setup(token, company, location, queue); }
  private static async Task<int> CreateService(Setup a) => await Id(await Send(HttpMethod.Post, "/services/", a.Token, new { locationId = a.LocationId, queueId = a.QueueId, name = "service_" + Guid.NewGuid().ToString("N"), description = "test", isGeneric = false, estimatedServiceMinutes = 5 }));
  private static async Task<int> CreateTicket(int queue) { using JsonDocument j = JsonDocument.Parse(await (await Client.PostAsJsonAsync("/tickets/", new { queueId = queue, email = (string?)null, serviceIds = (int[]?)null })).Content.ReadAsStringAsync()); return j.RootElement.GetProperty("data").GetProperty("id").GetInt32(); }
  private static async Task<string> CreateStaffAndLogin(Setup a) { string u = "test_ticketservice_staff_" + Guid.NewGuid().ToString("N")[..8]; await Send(HttpMethod.Post, $"/company-users/company/{a.CompanyId}/staff", a.Token, new { username = u, name = u, email = u + "@example.com", password = "Pass1!word" }); return await Login(u, "Pass1!word"); }
  private static async Task<string> RegisterAndLogin(string u) { await Register(u, "Pass1!word", "/auth/register-user"); return await Login(u, "Pass1!word"); }
  private static async Task Register(string u, string p, string route) => Assert.Equal(HttpStatusCode.Created, (await Client.PostAsJsonAsync(route, new { username = u, name = u, email = u + "@example.com", password = p })).StatusCode);
  private static async Task<string> Login(string u, string p) { HttpResponseMessage r = await Client.PostAsJsonAsync("/auth/login", new { username = u, password = p }); string t = await r.Content.ReadAsStringAsync(); Assert.Equal(HttpStatusCode.OK, r.StatusCode); return JsonDocument.Parse(t).RootElement.GetProperty("data").GetProperty("token").GetString()!; }
  private static async Task<int> Id(HttpResponseMessage r) { string t = await r.Content.ReadAsStringAsync(); Assert.True((int)r.StatusCode is >= 200 and < 300, t); return JsonDocument.Parse(t).RootElement.GetProperty("data").GetProperty("id").GetInt32(); }
  private static async Task<HttpResponseMessage> Send(HttpMethod m, string path, string? token = null, object? body = null) { HttpRequestMessage r = new(m, path); if (token != null) r.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token); if (body != null) r.Content = JsonContent.Create(body); return await Client.SendAsync(r); }
  private static async Task CheckBackend() { try { Assert.Equal(HttpStatusCode.OK, (await Client.GetAsync("/health")).StatusCode); } catch (HttpRequestException) { throw new XunitException("Backend must be started at http://localhost:3020 before running tests."); } }
  private record Setup(string Token, int CompanyId, int LocationId, int QueueId);
}
