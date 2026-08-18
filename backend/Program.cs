// backend\Program.cs

using QuestPDF.Infrastructure;
using backend;
using backend.auth.Extensions;
using backend.auth.Services;
using backend.auth.Controllers;
using backend.auth.Daos;
using backend.auth.Endpoints;
using backend.Controllers;
using backend.Endpoints;
using backend.Services;
using backend.Hubs;

QuestPDF.Settings.License = LicenseType.Community;

var builder = WebApplication.CreateBuilder(args);

// για να βάζω [required] etc
builder.Services.AddValidation();
builder.Services.AddSignalR();
builder.Services.AddScoped<LogController>();
builder.Services.AddScoped<CompanyDao>();
builder.Services.AddScoped<CompanyController>();
builder.Services.AddScoped<UserDao>();
builder.Services.AddScoped<UserController>();
builder.Services.AddScoped<AuthController>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<LocationDao>();
builder.Services.AddScoped<LocationController>();
builder.Services.AddScoped<CompanyUserDao>();
builder.Services.AddScoped<CompanyUserController>();
builder.Services.AddScoped<QueueDao>();
builder.Services.AddScoped<QueueResetService>();
builder.Services.AddScoped<QueueController>();
builder.Services.AddScoped<DeskDao>();
builder.Services.AddScoped<StaffDiscoveryDao>();
builder.Services.AddScoped<StaffController>();
builder.Services.AddScoped<DeskController>();
builder.Services.AddScoped<StaffSessionDao>();
builder.Services.AddScoped<StaffSessionController>();
builder.Services.AddScoped<ServiceDao>();
builder.Services.AddScoped<ServiceController>();
builder.Services.AddScoped<TicketDao>();
builder.Services.AddScoped<MissedTicketExpiryService>();
builder.Services.AddScoped<TicketController>();
builder.Services.AddScoped<TicketServiceDao>();
builder.Services.AddScoped<TicketServiceController>();
builder.Services.AddScoped<AdministrativeRecoveryDao>();
builder.Services.AddScoped<AdministrativeRecoveryService>();
builder.Services.AddScoped<AdministrativeRecoveryController>();
builder.Services.AddScoped<TicketEstimateService>();
builder.Services.AddScoped<TicketPdfService>();
builder.Services.AddScoped<TicketPdfController>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<AnalyticsDao>();
builder.Services.AddScoped<AnalyticsService>();
builder.Services.AddScoped<AnalyticsController>();
builder.Services.AddScoped<PublicController>();

builder.Services.AddJwtAuth(builder.Configuration);

builder.Services.AddCors( options =>
{
  options.AddPolicy("AllowedFrontend", policy =>
  {
    policy
      .WithOrigins(
        "http://localhost:8081",
        "http://localhost:5173",
        "https://myturn.portfolio-projects.space"
      )
      .AllowAnyHeader()
      .AllowAnyMethod()
      .AllowCredentials();
  });
});

var connString  = builder.Configuration.GetConnectionString("MyTurn");
builder.Services.AddSqlite<MyTurnContext>(connString);

var app = builder.Build();
app.UseCors("AllowedFrontend");

app.MigrateDb();
// για να κάνουμε server τα static pages που έχω στο wwwroot
app.UseStaticFiles();

app.MapHub<QueueHub>("/queue-hub");

app.MapGet("/", () => "Hello World!");
app.MapGet("/health", () => "ok");
app.MapGet("/ping", () =>
{
  System.Console.WriteLine("someone pinged here");
  return "Pong";
});
app.MapFrontLogEndpoints();

app.UseAuthentication();
app.UseAuthorization();

app.MapUsersEndpoints();
app.MapAuthEndpoints();
app.MapPublicEndpoints();

app.MapCompanyEndpoints();
app.MapLocationEndpoints();
app.MapCompanyUserEndpoints();
app.MapQueueEndpoints();
app.MapDeskEndpoints();
app.MapStaffEndpoints();
app.MapStaffSessionEndpoints();
app.MapServiceEndpoints();
app.MapTicketEndpoints();
app.MapTicketServiceEndpoints();
app.MapAdministrativeRecoveryEndpoints();
app.MapTicketPdfEndpoints();
app.MapAnalyticsEndpoints();

app.Urls.Add("http://localhost:3020");
app.Run();
