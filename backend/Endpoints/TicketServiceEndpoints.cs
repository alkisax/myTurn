// backend/Endpoints/TicketServiceEndpoints.cs

using backend.Controllers;
using System.Security.Claims;

namespace backend.Endpoints;

public static class TicketServiceEndpoints
{
  public static void MapTicketServiceEndpoints(this WebApplication app)
  {
    var group = app.MapGroup("/ticket-services").RequireAuthorization("AdminOnly");

    group.MapPost("/{ticketId:int}/{serviceId:int}", async (
      int ticketId,
      int serviceId,
      TicketServiceController controller,
      ClaimsPrincipal currentUser
    ) =>
    {
      return await controller.Create(
        ticketId,
        serviceId,
        currentUser
      );
    });


    group.MapGet("/ticket/{ticketId:int}", async (
      int ticketId,
      TicketServiceController controller,
      ClaimsPrincipal currentUser
    ) =>
    {
      return await controller.GetByTicketId(ticketId, currentUser);
    });

    group.MapDelete("/{ticketId:int}/{serviceId:int}", async (
      int ticketId,
      int serviceId,
      TicketServiceController controller,
      ClaimsPrincipal currentUser
    ) =>
    {
      return await controller.Delete(
        ticketId,
        serviceId,
        currentUser
      );
    });

    group.MapDelete("/ticket/{ticketId:int}", async (
      int ticketId,
      TicketServiceController controller,
      ClaimsPrincipal currentUser
    ) =>
    {
      return await controller.DeleteByTicketId(ticketId, currentUser);
    });

    group.MapGet("/service/{serviceId:int}", async (
      int serviceId,
      TicketServiceController controller,
      ClaimsPrincipal currentUser
    ) =>
    {
      return await controller.GetByServiceId(serviceId, currentUser);
    });
  }
}
