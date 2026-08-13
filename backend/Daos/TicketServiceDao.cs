// backend/Daos/TicketServiceDao.cs
// backend/Daos/TicketServiceDao.cs

using Backend;
using Microsoft.EntityFrameworkCore;

namespace backend;

public class TicketServiceDao
{
  private readonly MyTurnContext _db;

  public TicketServiceDao(MyTurnContext db)
  {
    _db = db;
  }


  public async Task<TicketService> Create(
    int ticketId,
    int serviceId
  )
  {
    var ticketService = new TicketService
    {
      TicketId = ticketId,
      ServiceId = serviceId
    };

    _db.TicketServices.Add(ticketService);
    await _db.SaveChangesAsync();
    return ticketService;
  }


  public async Task<List<TicketService>> GetByTicketId(int ticketId)
  {
    return await _db.TicketServices
      .Where(ts => ts.TicketId == ticketId)
      .ToListAsync();
  }

  public async Task<TicketService?> Delete(
    int ticketId,
    int serviceId
  )
  {
    var ticketService = await _db.TicketServices
      .FirstOrDefaultAsync(ts =>
        ts.TicketId == ticketId &&
        ts.ServiceId == serviceId
      );

    if (ticketService is null)
    {
      return null;
    }

    _db.TicketServices.Remove(ticketService);
    await _db.SaveChangesAsync();
    return ticketService;
  }

  public async Task<int> DeleteByTicketId(int ticketId)
  {
    var ticketServices = await _db.TicketServices
      .Where(ts => ts.TicketId == ticketId)
      .ToListAsync();

    if (ticketServices.Count == 0) return 0;

    _db.TicketServices.RemoveRange(ticketServices);

    await _db.SaveChangesAsync();
    return ticketServices.Count;
  }

  public async Task<List<TicketService>> GetByServiceId(int serviceId)
  {
    return await _db.TicketServices
      .Where(ts => ts.ServiceId == serviceId)
      .ToListAsync();
  }

  // Αυτό κάνει ακριβώς: → βρίσκω όλα τα TicketService → βρίσκω κάθε Service → service estimate ή company default → sum
  //Company default = 5, Service A = null, Service B = 8, total = 5 + 8 = 13
  public async Task<int> GetConfiguredDurationMinutes(
    int ticketId,
    int companyDefaultMinutes
  )
  {
    var ticketServices = await _db.TicketServices
      .Where(ts => ts.TicketId == ticketId)
      .ToListAsync();

    var totalMinutes = 0;

    foreach (var ticketService in ticketServices)
    {
      var service = await _db.Services.FindAsync(
        ticketService.ServiceId
      );

      if (service is null)
      {
        continue;
      }

      totalMinutes += service.EstimatedServiceMinutes ?? companyDefaultMinutes;
    }

    return totalMinutes;
  }
}