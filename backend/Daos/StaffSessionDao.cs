// backend\Daos\StaffSessionDao.cs

using Backend;
using Microsoft.EntityFrameworkCore;

namespace backend;

public class StaffSessionDao(MyTurnContext context)
{
  // SUPERADMIN / history
  public async Task<List<StaffSession>> GetAll()
  {
    return await context.StaffSessions
      .AsNoTracking()
      .ToListAsync();
  }


  public async Task<StaffSession?> GetById(int id)
  {
    return await context.StaffSessions.FindAsync(id);
  }


  // Όλο το ιστορικό ενός STAFF.
  public async Task<List<StaffSession>> GetByUserId(int userId)
  {
    return await context.StaffSessions
      .AsNoTracking()
      .Where(session => session.UserId == userId)
      .OrderByDescending(session => session.StartedAt)
      .ToListAsync();
  }


  // Ιστορικό χρήσης συγκεκριμένου Desk.
  public async Task<List<StaffSession>> GetByDeskId(int deskId)
  {
    return await context.StaffSessions
      .AsNoTracking()
      .Where(session => session.DeskId == deskId)
      .OrderByDescending(session => session.StartedAt)
      .ToListAsync();
  }


  // Ποιοι έχουν δουλέψει σε συγκεκριμένο Queue.
  public async Task<List<StaffSession>> GetByQueueId(int queueId)
  {
    return await context.StaffSessions
      .AsNoTracking()
      .Where(session => session.QueueId == queueId)
      .OrderByDescending(session => session.StartedAt)
      .ToListAsync();
  }


  // Το τρέχον ανοιχτό session ενός STAFF.
  // EndedAt == null σημαίνει ότι δεν έχει φύγει ακόμη από το Desk.
  public async Task<StaffSession?> GetActiveByUserId(int userId)
  {
    return await context.StaffSessions
      .FirstOrDefaultAsync(session =>
        session.UserId == userId &&
        session.EndedAt == null
      );
  }


  // Ελέγχουμε αν το Desk χρησιμοποιείται ήδη από άλλον STAFF.
  public async Task<StaffSession?> GetActiveByDeskId(int deskId)
  {
    return await context.StaffSessions
      .FirstOrDefaultAsync(session =>
        session.DeskId == deskId &&
        session.EndedAt == null
      );
  }


  public async Task<StaffSession> Create(StaffSession session)
  {
    context.StaffSessions.Add(session);

    await context.SaveChangesAsync();

    return session;
  }


  public async Task<StaffSession?> Update(
    int id,
    StaffSession updatedData
  )
  {
    var session = await context.StaffSessions.FindAsync(id);

    if (session is null)
    {
      return null;
    }

    session.Status = updatedData.Status;
    session.BreakStartedAt = updatedData.BreakStartedAt;
    session.TotalBreakSeconds = updatedData.TotalBreakSeconds;
    session.EndedAt = updatedData.EndedAt;
    session.UpdatedAt = DateTime.UtcNow;

    await context.SaveChangesAsync();

    return session;
  }
}