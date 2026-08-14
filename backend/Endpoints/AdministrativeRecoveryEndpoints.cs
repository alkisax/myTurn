using backend.Controllers;

namespace backend.Endpoints;

public static class AdministrativeRecoveryEndpoints
{
  public static void MapAdministrativeRecoveryEndpoints(
    this WebApplication app
  )
  {
    var group = app.MapGroup("/admin-recovery");

    group.MapPost("/staff-sessions/{sessionId:int}/force-end", async (
      int sessionId,
      AdministrativeRecoveryController controller,
      HttpContext context
    ) =>
    {
      return await controller.ForceEndStaffSession(
        sessionId,
        context.User
      );
    })
    .RequireAuthorization("AdminOnly");

    group.MapPost("/tickets/{ticketId:int}/mark-missed", async (
      int ticketId,
      AdministrativeRecoveryController controller,
      HttpContext context
    ) =>
    {
      return await controller.MarkTicketMissed(
        ticketId,
        context.User
      );
    })
    .RequireAuthorization("AdminOnly");
  }
}
