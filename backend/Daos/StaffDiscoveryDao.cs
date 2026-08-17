using backend.Dtos.StaffDtos;
using Microsoft.EntityFrameworkCore;

namespace backend;

public class StaffDiscoveryDao(MyTurnContext context)
{
  public async Task<List<StaffDeskDto>> GetDesksByCompanyId(
    int companyId,
    int? currentUserId = null
  )
  {
    return await (
      from desk in context.Desks.AsNoTracking()
      join location in context.Locations.AsNoTracking() on desk.LocationId equals location.Id
      join queue in context.Queues.AsNoTracking() on desk.QueueId equals queue.Id
      where desk.CompanyId == companyId
        && location.CompanyId == companyId
        && queue.CompanyId == companyId
        && !context.StaffSessions.Any(session =>
          session.DeskId == desk.Id &&
          session.EndedAt == null &&
          (currentUserId == null || session.UserId != currentUserId))
      orderby location.Name, desk.Name
      select new StaffDeskDto(
        desk.Id,
        desk.Name,
        location.Id,
        location.Name,
        queue.Id,
        queue.Name,
        desk.IsActive
      )
    ).ToListAsync();
  }
}
