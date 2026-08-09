// backend\Program.cs

using backend_csharp.Controllers;
using backend_csharp.Endpoints;

var builder = WebApplication.CreateBuilder(args);

// για να βάζω [required] etc
builder.Services.AddValidation();
builder.Services.AddScoped<LogController>();

builder.Services.AddCors( options =>
{
  options.AddPolicy("AllowedFrontend", policy =>
  {
    policy
      .WithOrigins(
        "http://localhost:8081",
        "http://localhost:5173"
      )
      .AllowAnyHeader()
      .AllowAnyMethod();
  });
});

var app = builder.Build();

// για να κάνουμε server τα static pages που έχω στο wwwroot
app.UseStaticFiles();

app.MapGet("/", () => "Hello World!");
app.MapGet("/health", () => "ok");
app.MapGet("/api/ping", () =>
{
  System.Console.WriteLine("someone pinged here");
  return "Pong";
});
app.MapFrontLogEndpoints();

app.Urls.Add("http://localhost:3020");
app.Run();
