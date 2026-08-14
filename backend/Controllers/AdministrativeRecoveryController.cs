using Backend;
using backend.Services;
using System.Security.Claims;

namespace backend.Controllers;

public class AdministrativeRecoveryController(
  AdministrativeRecoveryService recoveryService
)
{
  public async Task<IResult> ForceEndStaffSession(
    int sessionId,
    ClaimsPrincipal currentUser
  )
  {
    var session = await recoveryService.GetStaffSession(sessionId);

    if (session is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Staff session not found"
      });
    }

    if (!await recoveryService.HasCompanyAccess(session, currentUser))
    {
      return Results.Forbid();
    }

    if (session.EndedAt is not null)
    {
      return Results.Conflict(new
      {
        status = false,
        message = "Staff session is already closed"
      });
    }

    var endedSession = await recoveryService.ForceEndStaffSession(session);

    return Results.Ok(new
    {
      status = true,
      data = new
      {
        endedSession.Id,
        endedSession.UserId,
        endedSession.CompanyId,
        endedSession.LocationId,
        endedSession.QueueId,
        endedSession.DeskId,
        endedSession.Status,
        endedSession.StartedAt,
        endedSession.EndedAt,
        endedSession.TotalBreakSeconds
      }
    });
  }

  public async Task<IResult> MarkTicketMissed(
    int ticketId,
    ClaimsPrincipal currentUser
  )
  {
    var ticket = await recoveryService.GetTicket(ticketId);

    if (ticket is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Ticket not found"
      });
    }

    if (!await recoveryService.HasCompanyAccess(ticket, currentUser))
    {
      return Results.Forbid();
    }

    if (ticket.Status != "SERVING")
    {
      return Results.Conflict(new
      {
        status = false,
        message = "Ticket is not currently SERVING"
      });
    }

    var missedTicket = await recoveryService.MarkTicketMissed(ticket);

    if (missedTicket is null)
    {
      return Results.Conflict(new
      {
        status = false,
        message = "Ticket state changed before recovery completed"
      });
    }

    return Results.Ok(new
    {
      status = true,
      data = new
      {
        missedTicket.Id,
        missedTicket.CompanyId,
        missedTicket.LocationId,
        missedTicket.QueueId,
        missedTicket.Number,
        missedTicket.Status,
        missedTicket.ServedByUserId,
        missedTicket.ServedAtDeskId,
        missedTicket.ServingStartedAt,
        missedTicket.MissedAt,
        missedTicket.UpdatedAt
      }
    });
  }
}
