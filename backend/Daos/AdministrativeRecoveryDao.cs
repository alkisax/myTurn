using Backend;
using Microsoft.EntityFrameworkCore;

namespace backend;

public class AdministrativeRecoveryDao(MyTurnContext context)
{
  public async Task<StaffSession?> GetStaffSessionById(int sessionId)
  {
    return await context.StaffSessions.FindAsync(sessionId);
  }

  public async Task<Ticket?> GetTicketById(int ticketId)
  {
    return await context.Tickets.FindAsync(ticketId);
  }

  public async Task<bool> HasOpenStaffSession(
    int userId,
    int companyId
  )
  {
    return await context.StaffSessions.AnyAsync(session =>
      session.UserId == userId &&
      session.CompanyId == companyId &&
      session.EndedAt == null
    );
  }

  public async Task<bool> HasOpenDeskSession(int deskId)
  {
    return await context.StaffSessions.AnyAsync(session =>
      session.DeskId == deskId &&
      session.EndedAt == null
    );
  }

  public async Task<StaffSession> ForceEndStaffSession(
    StaffSession session,
    DateTime endedAt
  )
  {
    session.Status = "ENDED";
    session.EndedAt = endedAt;
    session.UpdatedAt = endedAt;

    await context.SaveChangesAsync();

    return session;
  }

  public async Task<Ticket?> MarkTicketMissedIfServing(
    int ticketId,
    DateTime missedAt
  )
  {
    var updatedCount = await context.Tickets
      .Where(ticket =>
        ticket.Id == ticketId &&
        ticket.Status == "SERVING"
      )
      .ExecuteUpdateAsync(setters => setters
        .SetProperty(ticket => ticket.Status, "MISSED")
        .SetProperty(ticket => ticket.MissedAt, missedAt)
        .SetProperty(ticket => ticket.UpdatedAt, missedAt)
      );

    if (updatedCount == 0)
    {
      return null;
    }

    return await context.Tickets
      .AsNoTracking()
      .FirstAsync(ticket => ticket.Id == ticketId);
  }
}
