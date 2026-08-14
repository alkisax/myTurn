using Backend;
using backend.auth.Daos;
using System.Security.Claims;

namespace backend.Services;

public class AdministrativeRecoveryService(
  AdministrativeRecoveryDao recoveryDao,
  CompanyUserDao companyUserDao
)
{
  public async Task<StaffSession?> GetStaffSession(int sessionId)
  {
    return await recoveryDao.GetStaffSessionById(sessionId);
  }

  public async Task<bool> HasCompanyAccess(
    StaffSession session,
    ClaimsPrincipal currentUser
  )
  {
    var role = currentUser.FindFirst(ClaimTypes.Role)?.Value;

    if (role == "SUPERADMIN")
    {
      return true;
    }

    var userIdValue = currentUser.FindFirst("id")?.Value;

    if (!int.TryParse(userIdValue, out var userId))
    {
      return false;
    }

    var companyUser = await companyUserDao.GetByUserAndCompany(
      userId,
      session.CompanyId
    );

    return companyUser is not null;
  }

  public async Task<bool> HasCompanyAccess(
    Ticket ticket,
    ClaimsPrincipal currentUser
  )
  {
    var role = currentUser.FindFirst(ClaimTypes.Role)?.Value;

    if (role == "SUPERADMIN")
    {
      return true;
    }

    var userIdValue = currentUser.FindFirst("id")?.Value;

    if (!int.TryParse(userIdValue, out var userId))
    {
      return false;
    }

    var companyUser = await companyUserDao.GetByUserAndCompany(
      userId,
      ticket.CompanyId
    );

    return companyUser is not null;
  }

  public async Task<StaffSession> ForceEndStaffSession(
    StaffSession session
  )
  {
    var now = DateTime.UtcNow;

    if (session.Status == "BREAK" && session.BreakStartedAt is not null)
    {
      var breakSeconds = (int)(now - session.BreakStartedAt.Value).TotalSeconds;
      session.TotalBreakSeconds += breakSeconds;
    }

    session.BreakStartedAt = null;

    return await recoveryDao.ForceEndStaffSession(session, now);
  }

  public async Task<Ticket?> GetTicket(int ticketId)
  {
    return await recoveryDao.GetTicketById(ticketId);
  }

  public async Task<Ticket?> MarkTicketMissed(Ticket ticket)
  {
    return await recoveryDao.MarkTicketMissedIfServing(
      ticket.Id,
      DateTime.UtcNow
    );
  }

  public async Task<bool> HasOpenStaffSession(
    int userId,
    int companyId
  )
  {
    return await recoveryDao.HasOpenStaffSession(userId, companyId);
  }

  public async Task<bool> HasOpenDeskSession(int deskId)
  {
    return await recoveryDao.HasOpenDeskSession(deskId);
  }
}
