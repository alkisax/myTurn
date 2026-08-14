```C#
using backend_dotnet;

var builder = WebApplication.CreateBuilder(args);
// for port consistency on Hetzner
builder.WebHost.UseUrls(
  builder.Configuration["Urls"]!
);

// CORS αφορά κυρίως browser-based requests (React web / Expo web) και προστατεύει από cross-origin requests. Στο React Native native app συνήθως δεν εφαρμόζεται το ίδιο browser security model, αλλά κρατάμε CORS για: - consistency με web/expo dev - local development - πιθανό future web client
builder.Services.AddCors(options =>
{
  options.AddPolicy("AllowFrontend", policy =>
  {
    policy
      .WithOrigins(
        "http://localhost:8081",
        "https://signalr-room-relay.portfolio-projects.space"
      )
      .AllowAnyHeader()
      .AllowAnyMethod()
      .AllowCredentials();
  });
});

builder.Services.AddValidation();
builder.Services.AddScoped<LogFromFrontController>();
builder.Services.AddSignalR();

var app = builder.Build();

app.UseCors("AllowFrontend");

app.MapHub<RoomHub>("/room");
Console.WriteLine("🔌 SignalR RoomHub listening on /room");

// για να κάνουμε server τα static pages που έχω στο wlroots
app.UseStaticFiles();

app.MapGet("/", () => "Hello World!");

app.MapGet("/api/ping", () =>
{
  Console.WriteLine("someone pinged here");
  return "pong";
});

app.MapGet("/health", () =>
{
  return "ok";
});

app.MapLogFromFrontEndpoints();

// με αυτό app.UseStaticFiles() θα ήταν οκ. ο λογος που τα προσθέτουμε είναι γιατι θέλουμε τα endpoints να είναι mirror του node και τωρα σερβίρονται με το .html
app.MapGet("/privacy", async (HttpContext context) =>
{
  string filePath = Path.Combine(
    app.Environment.ContentRootPath,
    "wwwroot",
    "privacy.html"
  );

  await context.Response.SendFileAsync(filePath);
});

app.MapGet("/delete-account", async (HttpContext context) =>
{
  string filePath = Path.Combine(
    app.Environment.ContentRootPath,
    "wwwroot",
    "delete-account.html"
  );

  await context.Response.SendFileAsync(filePath);
});

app.Run();
```