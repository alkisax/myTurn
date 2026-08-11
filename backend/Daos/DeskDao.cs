// backend\Daos\DeskDao.cs

using Backend;
using Microsoft.EntityFrameworkCore;

namespace backend;

public class DeskDao(MyTurnContext context)
{
  public async Task<List<Desk>> GetAll()
  {
    return await context.Desks
      .AsNoTracking()
      .ToListAsync();
  }


  public async Task<Desk?> GetById(int id)
  {
    return await context.Desks.FindAsync(id);
  }


  public async Task<List<Desk>> GetByLocationId(int locationId)
  {
    return await context.Desks
      .AsNoTracking()
      .Where(desk => desk.LocationId == locationId)
      .ToListAsync();
  }


  public async Task<List<Desk>> GetByCompanyId(int companyId)
  {
    return await context.Desks
      .AsNoTracking()
      .Where(desk => desk.CompanyId == companyId)
      .ToListAsync();
  }


  public async Task<List<Desk>> GetByQueueId(int queueId)
  {
    return await context.Desks
      .AsNoTracking()
      .Where(desk => desk.QueueId == queueId)
      .ToListAsync();
  }


  public async Task<Desk> Create(Desk desk)
  {
    context.Desks.Add(desk);
    await context.SaveChangesAsync();

    return desk;
  }


  public async Task<Desk?> Update(int id, Desk updatedData)
  {
    var desk = await context.Desks.FindAsync(id);

    if (desk is null)
    {
      return null;
    }

    desk.Name = updatedData.Name;
    desk.QueueId = updatedData.QueueId;
    desk.IsActive = updatedData.IsActive;
    desk.UpdatedAt = DateTime.UtcNow;

    await context.SaveChangesAsync();

    return desk;
  }


  public async Task<Desk?> Delete(int id)
  {
    var desk = await context.Desks.FindAsync(id);

    if (desk is null)
    {
      return null;
    }

    context.Desks.Remove(desk);
    await context.SaveChangesAsync();

    return desk;
  }
}