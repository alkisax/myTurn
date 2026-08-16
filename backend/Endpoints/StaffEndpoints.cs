using backend.Controllers;

namespace backend.Endpoints;

public static class StaffEndpoints
{
  public static void MapStaffEndpoints(this WebApplication app)
  {
    app.MapGet("/staff/companies/{companyId:int}/desks", async (
      int companyId,
      StaffController controller,
      HttpContext context
    ) => await controller.GetDesks(companyId, context.User))
      .RequireAuthorization("StaffOrAdmin");
  }
}
