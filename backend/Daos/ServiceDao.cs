// backend\Daos\ServiceDao.cs
using Backend;
using Microsoft.EntityFrameworkCore;
namespace backend;
public class ServiceDao(MyTurnContext context)
{
  public async Task<List<Service>> GetAll()
  {
    return await context.Services
      .AsNoTracking()
      .ToListAsync();
  }
  public async Task<Service?> GetById(int id)
  {
    return await context.Services.FindAsync(id);
  }
  public async Task<List<Service>> GetByLocationId(int locationId)
  {
    return await context.Services
      .AsNoTracking()
      .Where(service => service.LocationId == locationId)
      .ToListAsync();
  }
  public async Task<List<Service>> GetByCompanyId(int companyId)
  {
    return await context.Services
      .AsNoTracking()
      .Where(service => service.CompanyId == companyId)
      .ToListAsync();
  }
  public async Task<Service> Create(Service service)
  {
    context.Services.Add(service);
    await context.SaveChangesAsync();
    return service;
  }
  public async Task<Service?> Update(int id, Service updatedData)
  {
    var service = await context.Services.FindAsync(id);
    if (service is null)
    {
      return null;
    }
    service.Name = updatedData.Name;
    service.Description = updatedData.Description;
    service.IsActive = updatedData.IsActive;
    service.IsGeneric = updatedData.IsGeneric;
    service.EstimatedServiceMinutes = updatedData.EstimatedServiceMinutes;
    service.UpdatedAt = DateTime.UtcNow;
    await context.SaveChangesAsync();
    return service;
  }
  public async Task<Service?> Delete(int id)
  {
    var service = await context.Services.FindAsync(id);
    if (service is null)
    {
      return null;
    }
    context.Services.Remove(service);
    await context.SaveChangesAsync();
    return service;
  }
}