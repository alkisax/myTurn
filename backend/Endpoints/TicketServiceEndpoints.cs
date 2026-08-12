// backend/Endpoints/TicketServiceEndpoints.cs

using backend.Controllers;

namespace backend.Endpoints;

public static class TicketServiceEndpoints
{
  public static void MapTicketServiceEndpoints(this WebApplication app)
  {
    var group = app.MapGroup("/ticket-services");

    group.MapPost("/{ticketId:int}/{serviceId:int}", async (
      int ticketId,
      int serviceId,
      TicketServiceController controller
    ) =>
    {
      return await controller.Create(
        ticketId,
        serviceId
      );
    })
    .RequireAuthorization();


    group.MapGet("/ticket/{ticketId:int}", async (
      int ticketId,
      TicketServiceController controller
    ) =>
    {
      return await controller.GetByTicketId(ticketId);
    })
    .RequireAuthorization();

    group.MapDelete("/{ticketId:int}/{serviceId:int}", async (
      int ticketId,
      int serviceId,
      TicketServiceController controller
    ) =>
    {
      return await controller.Delete(
        ticketId,
        serviceId
      );
    })
    .RequireAuthorization();

    group.MapDelete("/ticket/{ticketId:int}", async (
      int ticketId,
      TicketServiceController controller
    ) =>
    {
      return await controller.DeleteByTicketId(ticketId);
    })
    .RequireAuthorization();

    group.MapGet("/service/{serviceId:int}", async (
      int serviceId,
      TicketServiceController controller
    ) =>
    {
      return await controller.GetByServiceId(serviceId);
    })
    .RequireAuthorization();
  }
}