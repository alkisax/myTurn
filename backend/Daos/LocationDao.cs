// backend\Daos\LocationDao.cs

using Backend;
using Microsoft.EntityFrameworkCore;

namespace backend;

public class LocationDao(MyTurnContext context)
{
  public async Task<List<Location>> GetAll()
  {
    return await context.Locations
      .AsNoTracking()
      .ToListAsync();
  }


  // Επιστρέφει μόνο τα locations που ανήκουν σε companies
  // στις οποίες έχει πρόσβαση ο συγκεκριμένος user μέσω CompanyUser.
  // Χρήσιμο για ADMIN ώστε να μην βλέπει locations άλλων εταιριών.
  public async Task<List<Location>> GetByUserId(int userId)
  {
    return await context.Locations
      .AsNoTracking()
      .Where(location =>
        context.CompanyUsers.Any(companyUser =>
          companyUser.UserId == userId &&
          companyUser.CompanyId == location.CompanyId
        )
      )
      .ToListAsync();
  }


  public async Task<Location?> GetById(int id)
  {
    return await context.Locations.FindAsync(id);
  }


  public async Task<List<Location>> GetByCompanyId(int companyId)
  {
    return await context.Locations
      .AsNoTracking()
      .Where(location => location.CompanyId == companyId)
      .ToListAsync();
  }


  public async Task<Location> Create(Location location)
  {
    context.Locations.Add(location);
    await context.SaveChangesAsync();

    return location;
  }


  public async Task<Location?> Update(int id, Location updatedData)
  {
    var location = await context.Locations.FindAsync(id);

    if (location is null)
    {
      return null;
    }

    location.Name = updatedData.Name;
    location.Address = updatedData.Address;
    location.Country = updatedData.Country;
    location.Latitude = updatedData.Latitude;
    location.Longitude = updatedData.Longitude;
    location.TimeZoneId = updatedData.TimeZoneId;
    location.IsActive = updatedData.IsActive;
    location.UpdatedAt = DateTime.UtcNow;

    await context.SaveChangesAsync();

    return location;
  }


  public async Task<Location?> Delete(int id)
  {
    var location = await context.Locations.FindAsync(id);

    if (location is null)
    {
      return null;
    }

    context.Locations.Remove(location);
    await context.SaveChangesAsync();

    return location;
  }
}
