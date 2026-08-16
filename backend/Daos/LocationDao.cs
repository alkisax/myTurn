// backend\Daos\LocationDao.cs

using Backend;
using Microsoft.EntityFrameworkCore;
using backend.Services;

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

  public async Task<Location?> GetBySlug(int companyId, string slug)
  {
    return await context.Locations
      .AsNoTracking()
      .SingleOrDefaultAsync(location => location.CompanyId == companyId && location.Slug == slug);
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
    var baseSlug = SlugService.FromName(location.Name);
    var slug = baseSlug;
    var suffix = 2;
    while (await context.Locations.AnyAsync(existing =>
      existing.CompanyId == location.CompanyId && existing.Slug == slug))
    {
      slug = $"{baseSlug}-{suffix++}";
    }

    location.Slug = slug;
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
    location.Slug = await GetAvailableSlug(
      location.CompanyId,
      SlugService.FromName(updatedData.Name),
      id);
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

  private async Task<string> GetAvailableSlug(int companyId, string baseSlug, int? excludedId = null)
  {
    var slug = baseSlug;
    var suffix = 2;
    while (await context.Locations.AnyAsync(location =>
      location.CompanyId == companyId && location.Slug == slug &&
      (!excludedId.HasValue || location.Id != excludedId.Value)))
    {
      slug = $"{baseSlug}-{suffix++}";
    }

    return slug;
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
