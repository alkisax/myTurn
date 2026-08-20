using backend.Controllers;

namespace backend.Endpoints;

public static class SuperAdminEndpoints
{
  public static void MapSuperAdminEndpoints(this WebApplication app)
  {
    var group = app.MapGroup("/superadmin")
      .RequireAuthorization("SuperAdminOnly");

    group.MapGet("/admins", (SuperAdminController controller) =>
      controller.GetAdmins());
    group.MapGet("/companies", (SuperAdminController controller) =>
      controller.GetCompanies());
    group.MapGet("/stats", (SuperAdminController controller) =>
      controller.GetStats());
    group.MapDelete("/admins/{adminId:int}", (
      int adminId,
      SuperAdminController controller) =>
      controller.DeleteAdmin(adminId));
  }
}
