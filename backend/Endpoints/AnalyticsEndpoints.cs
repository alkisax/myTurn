namespace backend.Endpoints;

public static class AnalyticsEndpoints
{
  public static void MapAnalyticsEndpoints(this WebApplication app)
  {
    var group = app.MapGroup("/analytics/company/{companyId:int}").RequireAuthorization("AdminOnly");
    group.MapGet("/overview", (int companyId, AnalyticsController controller, HttpContext context) => controller.GetCompanyOverview(companyId, context.User));
    group.MapGet("/tickets-by-hour", (int companyId, AnalyticsController controller, HttpContext context) => controller.GetTicketsByHour(companyId, context.User));
    group.MapGet("/tickets-by-staff", (int companyId, AnalyticsController controller, HttpContext context) => controller.GetTicketsByStaff(companyId, context.User));
    group.MapGet("/tickets-by-service", (int companyId, AnalyticsController controller, HttpContext context) => controller.GetTicketsByService(companyId, context.User));
    group.MapGet("/tickets-by-location", (int companyId, AnalyticsController controller, HttpContext context) => controller.GetTicketsByLocation(companyId, context.User));
    group.MapGet("/tickets-by-queue", (int companyId, AnalyticsController controller, HttpContext context) => controller.GetTicketsByQueue(companyId, context.User));
    group.MapGet("/peak-hours", (int companyId, AnalyticsController controller, HttpContext context) => controller.GetPeakHours(companyId, context.User));
    group.MapGet("/completion-stats", (int companyId, AnalyticsController controller, HttpContext context) => controller.GetCompletionStats(companyId, context.User));
  }
}
