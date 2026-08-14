using Microsoft.AspNetCore.SignalR.Client;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Xunit;
using Xunit.Sdk;

namespace MyTurn.Backend.Tests;

public class SignalRTests
{
  private static readonly HttpClient Client = new() { BaseAddress = new Uri("http://localhost:3020") };

  [Fact]
  public async Task ClientCanConnectToQueueHub()
  {
    await CheckBackend();
    HubConnection connection = new HubConnectionBuilder().WithUrl("http://localhost:3020/queue-hub").Build();
    try { await connection.StartAsync(); Assert.Equal(HubConnectionState.Connected, connection.State); }
    finally { await connection.DisposeAsync(); }
  }

  [Fact]
  public async Task ClientCanJoinQueue()
  {
    await CheckBackend(); Setup setup = await CreateSetup();
    HubConnection connection = new HubConnectionBuilder().WithUrl("http://localhost:3020/queue-hub").Build();
    try { await connection.StartAsync(); await connection.InvokeAsync("JoinQueue", setup.QueueId); Assert.Equal(HubConnectionState.Connected, connection.State); }
    finally { await connection.DisposeAsync(); }
  }

  [Fact]
  public async Task ClientReceivesNowServingChangedAfterNext()
  {
    await CheckBackend(); Setup setup = await CreateSetup();
    TaskCompletionSource<JsonElement> eventReceived = new(TaskCreationOptions.RunContinuationsAsynchronously);
    HubConnection connection = new HubConnectionBuilder().WithUrl("http://localhost:3020/queue-hub").Build();
    connection.On<JsonElement>("NowServingChanged", data => eventReceived.TrySetResult(data));
    try
    {
      await connection.StartAsync(); await connection.InvokeAsync("JoinQueue", setup.QueueId);
      int ticketNumber = await CreateTicket(setup.QueueId);
      HttpResponseMessage next = await Send(HttpMethod.Post, "/tickets/next", setup.StaffToken);
      Assert.Equal(HttpStatusCode.OK, next.StatusCode);
      JsonElement data = await eventReceived.Task.WaitAsync(TimeSpan.FromSeconds(5));
      Assert.Equal(setup.QueueId, data.GetProperty("queueId").GetInt32());
      Assert.Equal(setup.DeskId, data.GetProperty("deskId").GetInt32());
      Assert.Equal(ticketNumber, data.GetProperty("number").GetInt32());
    }
    finally { await connection.DisposeAsync(); }
  }

  private static async Task<Setup> CreateSetup()
  {
    string unique = Guid.NewGuid().ToString("N")[..8]; string admin = "test_signalr_admin_" + unique; string password = "SignalrPass1!";
    await Register(admin, password, "/auth/register-admin"); string adminToken = await Login(admin, password);
    int company = await Id(await Send(HttpMethod.Post, "/companies/", adminToken, new { name = "test_signalr_company_" + unique, defaultEstimatedServiceMinutes = 5 }));
    int location = await Id(await Send(HttpMethod.Post, "/locations/", adminToken, new { companyId = company, name = "test_signalr_location_" + unique, address = "test", country = "GR" }));
    int queue = await Id(await Send(HttpMethod.Post, "/queues/", adminToken, new { locationId = location, name = "test_signalr_queue_" + unique, description = "test", autoResetEnabled = false, resetAt = (string?)null }));
    int desk = await Id(await Send(HttpMethod.Post, "/desks/", adminToken, new { locationId = location, queueId = queue, name = "test_signalr_desk_" + unique }));
    string staff = "test_signalr_staff_" + unique; await Send(HttpMethod.Post, $"/company-users/company/{company}/staff", adminToken, new { username = staff, name = staff, email = staff + "@example.com", password }); string staffToken = await Login(staff, password);
    HttpResponseMessage session = await Send(HttpMethod.Post, "/staff-sessions/", staffToken, new { deskId = desk }); Assert.Equal(HttpStatusCode.Created, session.StatusCode);
    return new Setup(staffToken, queue, desk);
  }
  private static async Task<int> CreateTicket(int queue) { string text = await (await Client.PostAsJsonAsync("/tickets/", new { queueId = queue, email = (string?)null, serviceIds = (int[]?)null })).Content.ReadAsStringAsync(); using JsonDocument json = JsonDocument.Parse(text); return json.RootElement.GetProperty("data").GetProperty("number").GetInt32(); }
  private static async Task Register(string u, string p, string route) => Assert.Equal(HttpStatusCode.Created, (await Client.PostAsJsonAsync(route, new { username = u, name = u, email = u + "@example.com", password = p })).StatusCode);
  private static async Task<string> Login(string u, string p) { HttpResponseMessage r = await Client.PostAsJsonAsync("/auth/login", new { username = u, password = p }); string text = await r.Content.ReadAsStringAsync(); Assert.Equal(HttpStatusCode.OK, r.StatusCode); return JsonDocument.Parse(text).RootElement.GetProperty("data").GetProperty("token").GetString()!; }
  private static async Task<int> Id(HttpResponseMessage r) { string text = await r.Content.ReadAsStringAsync(); Assert.True((int)r.StatusCode is >= 200 and < 300, text); return JsonDocument.Parse(text).RootElement.GetProperty("data").GetProperty("id").GetInt32(); }
  private static async Task<HttpResponseMessage> Send(HttpMethod m, string path, string? token = null, object? body = null) { HttpRequestMessage r = new(m, path); if (token != null) r.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token); if (body != null) r.Content = JsonContent.Create(body); return await Client.SendAsync(r); }
  private static async Task CheckBackend() { try { Assert.Equal(HttpStatusCode.OK, (await Client.GetAsync("/health")).StatusCode); } catch (HttpRequestException) { throw new XunitException("Backend must be started at http://localhost:3020 before running tests."); } }
  private record Setup(string StaffToken, int QueueId, int DeskId);
}
