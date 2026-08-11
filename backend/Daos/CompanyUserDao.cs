// backend\Daos\CompanyUserDao.cs

using Backend;
using Microsoft.EntityFrameworkCore;

namespace backend;

public class CompanyUserDao(MyTurnContext context)
{
  public async Task<List<CompanyUser>> GetAll()
  {
    return await context.CompanyUsers
      .AsNoTracking()
      .ToListAsync();
  }

  public async Task<CompanyUser?> GetById(int id)
  {
    return await context.CompanyUsers.FindAsync(id);
  }

  public async Task<List<CompanyUser>> GetByUserId(int userId)
  {
    return await context.CompanyUsers
      .AsNoTracking()
      .Where(companyUser => companyUser.UserId == userId)
      .ToListAsync();
  }

  public async Task<List<CompanyUser>> GetByCompanyId(int companyId)
  {
    return await context.CompanyUsers
      .AsNoTracking()
      .Where(companyUser => companyUser.CompanyId == companyId)
      .ToListAsync();
  }

  public async Task<CompanyUser?> GetByUserAndCompany(
    int userId,
    int companyId
  )
  {
    return await context.CompanyUsers
      .AsNoTracking()
      .FirstOrDefaultAsync(companyUser =>
        companyUser.UserId == userId &&
        companyUser.CompanyId == companyId
      );
  }

  public async Task<CompanyUser> Create(CompanyUser companyUser)
  {
    context.CompanyUsers.Add(companyUser);
    await context.SaveChangesAsync();

    return companyUser;
  }

  public async Task<CompanyUser?> Delete(int id)
  {
    var companyUser = await context.CompanyUsers.FindAsync(id);

    if (companyUser is null)
    {
      return null;
    }

    context.CompanyUsers.Remove(companyUser);
    await context.SaveChangesAsync();

    return companyUser;
  }

  // Χρησιμοποιείται όταν ένας ADMIN αφαιρεί συγκεκριμένο STAFF
  // από μία συγκεκριμένη Company.
  public async Task<CompanyUser?> DeleteByUserAndCompany(
    int userId,
    int companyId
  )
  {
    var companyUser = await context.CompanyUsers
      .FirstOrDefaultAsync(companyUser =>
        companyUser.UserId == userId &&
        companyUser.CompanyId == companyId
      );

    if (companyUser is null)
    {
      return null;
    }

    context.CompanyUsers.Remove(companyUser);
    await context.SaveChangesAsync();

    return companyUser;
  }
}