using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;
using Xunit.Sdk;

namespace MyTurn.Backend.Tests;

public class AdministrativeRecoveryTests
{
  private static readonly HttpClient Client = new() { BaseAddress = new Uri("http://localhost:3020") };
  [Fact] public async Task AdminCanForceEndStaffSession() { await Check(); Setup a = await CreateSetup("test_recovery_"); string staff = await CreateStaff(a); int session = await Start(a, staff); HttpResponseMessage r = await Send(HttpMethod.Post, $"/admin-recovery/staff-sessions/{session}/force-end", a.Token); Assert.Equal(HttpStatusCode.OK, r.StatusCode); }
  [Fact] public async Task AdminCanMarkServingTicketMissed() { await Check(); Setup a = await CreateSetup("test_recovery_missed_"); string staff = await CreateStaff(a); await Start(a, staff); int ticket = await Ticket(a.QueueId); await Send(HttpMethod.Post, "/tickets/next", staff); HttpResponseMessage r = await Send(HttpMethod.Post, $"/admin-recovery/tickets/{ticket}/mark-missed", a.Token); Assert.Equal(HttpStatusCode.OK, r.StatusCode); }
  [Fact] public async Task MarkMissedRejectsWaitingTicket() { await Check(); Setup a = await CreateSetup("test_recovery_waiting_"); int ticket = await Ticket(a.QueueId); HttpResponseMessage r = await Send(HttpMethod.Post, $"/admin-recovery/tickets/{ticket}/mark-missed", a.Token); Assert.Equal(HttpStatusCode.Conflict, r.StatusCode); }
  [Fact] public async Task OtherAdminCannotForceEndSession() { await Check(); Setup a = await CreateSetup("test_recovery_a_"); Setup b = await CreateSetup("test_recovery_b_"); string staff = await CreateStaff(b); int session = await Start(b, staff); HttpResponseMessage r = await Send(HttpMethod.Post, $"/admin-recovery/staff-sessions/{session}/force-end", a.Token); Assert.Equal(HttpStatusCode.Forbidden, r.StatusCode); }
  private static async Task<Setup> CreateSetup(string p) { string u = p + Guid.NewGuid().ToString("N")[..8]; await Register(u, "/auth/register-admin"); string token = await Login(u); int c = await Id(await Send(HttpMethod.Post, "/companies/", token, new { name = u, defaultEstimatedServiceMinutes = 5 })); int l = await Id(await Send(HttpMethod.Post, "/locations/", token, new { companyId = c, name = u, address = "test", country = "GR" })); int q = await Id(await Send(HttpMethod.Post, "/queues/", token, new { locationId = l, name = u, description = "test", autoResetEnabled = false, resetAt = (string?)null })); int d = await Id(await Send(HttpMethod.Post, "/desks/", token, new { locationId = l, queueId = q, name = u })); return new(token, c, l, q, d); }
  private static async Task<string> CreateStaff(Setup a) { string u = "test_recovery_staff_" + Guid.NewGuid().ToString("N")[..8]; await Send(HttpMethod.Post, $"/company-users/company/{a.CompanyId}/staff", a.Token, new { username = u, name = u, email = u + "@example.com", password = "Pass1!word" }); return await Login(u); }
  private static async Task<int> Start(Setup a, string staff) => await Id(await Send(HttpMethod.Post, "/staff-sessions/", staff, new { deskId = a.DeskId }));
  private static async Task<int> Ticket(int q) { string t = await (await Client.PostAsJsonAsync("/tickets/", new { queueId = q, email = (string?)null, serviceIds = (int[]?)null })).Content.ReadAsStringAsync(); return JsonDocument.Parse(t).RootElement.GetProperty("data").GetProperty("id").GetInt32(); }
  private static async Task Register(string u, string route) => Assert.Equal(HttpStatusCode.Created, (await Client.PostAsJsonAsync(route, new { username = u, name = u, email = u + "@example.com", password = "Pass1!word" })).StatusCode);
  private static async Task<string> Login(string u) { HttpResponseMessage r = await Client.PostAsJsonAsync("/auth/login", new { username = u, password = "Pass1!word" }); string t = await r.Content.ReadAsStringAsync(); Assert.Equal(HttpStatusCode.OK, r.StatusCode); return JsonDocument.Parse(t).RootElement.GetProperty("data").GetProperty("token").GetString()!; }
  private static async Task<int> Id(HttpResponseMessage r) { string t = await r.Content.ReadAsStringAsync(); Assert.True((int)r.StatusCode is >= 200 and < 300, t); return JsonDocument.Parse(t).RootElement.GetProperty("data").GetProperty("id").GetInt32(); }
  private static async Task<HttpResponseMessage> Send(HttpMethod m, string p, string? token = null, object? body = null) { HttpRequestMessage r = new(m, p); if (token != null) r.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token); if (body != null) r.Content = JsonContent.Create(body); return await Client.SendAsync(r); }
  private static async Task Check() { try { Assert.Equal(HttpStatusCode.OK, (await Client.GetAsync("/health")).StatusCode); } catch (HttpRequestException) { throw new XunitException("Backend must be started at http://localhost:3020 before running tests."); } }
  private record Setup(string Token, int CompanyId, int LocationId, int QueueId, int DeskId);
}
