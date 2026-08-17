// backend\Endpoints\TicketEndpoints.cs
using backend.Controllers;
using backend.Dtos.TicketDtos;

namespace backend.Endpoints;

public static class TicketEndpoints
{
  public static void MapTicketEndpoints(this WebApplication app)
  {
    var group = app.MapGroup("/tickets");

    // POST /tickets
    // anonymous ή logged-in USER δεν βάζουμε: .RequireAuthorization() γιατί θέλουμε να μπορεί να εκδώσει ticket και anonymous χρήστης.
    group.MapPost("/", async (
      CreateTicketDto dto,
      TicketController controller,
      HttpContext context
    ) =>
    {
      return await controller.Create(
        dto,
        context.User
      );
    });

    group.MapPost("/kiosk", async (
      CreateTicketDto dto,
      TicketController controller,
      HttpContext context
    ) => await controller.CreateKiosk(dto, context.User))
    .RequireAuthorization("StaffOrAdmin");

    // GET /tickets/id/5
    group.MapGet("/id/{ticketId:int}", async (
      int ticketId,
      TicketController controller,
      HttpContext context
    ) =>
    {
      return await controller.GetById(
        ticketId,
        context.User
      );
    })
    .RequireAuthorization();

    // βλέπει ο user τα ticket του
    group.MapGet("/mine", async (
      TicketController controller,
      HttpContext context
    ) =>
    {
      return await controller.GetMine(context.User);
    })
    .RequireAuthorization();

    group.MapGet("/identify-by-pin/{pin}", async (
      string pin,
      TicketController controller,
      HttpContext context
    ) => await controller.IdentifyByPin(pin, context.User))
    .RequireAuthorization();

    // GET /tickets/{trackingToken}
    // Public tracking endpoint. δεν βάζουμε: .RequireAuthorization()
    group.MapGet("/{trackingToken}", async (
      string trackingToken,
      TicketController controller
    ) =>
    {
      return await controller.GetByTrackingToken(
        trackingToken
      );
    });

    // GET /tickets/queue/:queueId
    // για όλο το προσωπικό να βλέπει ποιοι αριθμοί είναι σε ένα queue. Το staff βλέπει το queue στο οποίο είναι assigned, ο admin τα queue του company και ο super admin όλα
    group.MapGet("/queue/{queueId:int}", async (
      int queueId,
      TicketController controller,
      HttpContext context
    ) =>
    {
      return await controller.GetByQueueId(
        queueId,
        context.User
      );
    })
    .RequireAuthorization(); // δεν χρησιμοποιούμε AdminOnly, επειδή αυτό θα απέκλειε τον STAFF

    group.MapGet("/queue/{queueId:int}/history", async (
      int queueId,
      TicketController controller,
      HttpContext context
    ) =>
    {
      return await controller.GetHistoryByQueueId(
        queueId,
        context.User
      );
    })
    .RequireAuthorization();

    // next
    // Δεν χρειάζεται queueId στο URL. Ο staff δεν λέει: δώσε μου next από queue 3Το backend ξέρει ήδη το queue από το StaffSession.
    group.MapPost("/next", async (
      TicketController controller,
      HttpContext context
    ) =>
    {
      return await controller.Next(
        context.User
      );
    })
    .RequireAuthorization();

    group.MapPost("/{ticketId:int}/complete", async (
      int ticketId,
      CompleteTicketDto dto,
      TicketController controller,
      HttpContext context
    ) => await controller.Complete(
      ticketId,
      dto,
      context.User
    ))
    .RequireAuthorization();

    // SERVING -> MISSED
    group.MapPost("/{ticketId:int}/missed", async (
      int ticketId,
      TicketController controller,
      HttpContext context
    ) => await controller.MarkMissed(
      ticketId,
      context.User
    ))
    .RequireAuthorization();


    // MISSED -> SERVING
    group.MapPost("/{ticketId:int}/recall", async (
      int ticketId,
      TicketController controller,
      HttpContext context
    ) => await controller.RecallMissed(
      ticketId,
      context.User
    ))
    .RequireAuthorization();

    // MISSED -> EXPIRED
    group.MapPost("/{ticketId:int}/expire", async (
      int ticketId,
      TicketController controller,
      HttpContext context
    ) => await controller.ExpireMissed(
      ticketId,
      context.User
    ))
    .RequireAuthorization();

    // WAITING -> CANCELLED
    group.MapPost("/{ticketId:int}/cancel", async (
      int ticketId,
      TicketController controller,
      HttpContext context
    ) => await controller.Cancel(
      ticketId,
      context.User
    ))
    .RequireAuthorization();


    // SUPERADMIN hard delete
    group.MapDelete("/{ticketId:int}", async (
      int ticketId,
      TicketController controller
    ) =>
    {
      return await controller.Delete(ticketId);
    })
    .RequireAuthorization("SuperAdminOnly");

  }
}
