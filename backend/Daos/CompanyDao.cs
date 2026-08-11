// backend\Daos\CompanyDao.cs

using Backend;
using Microsoft.EntityFrameworkCore;

namespace backend;

// το MyTurnContext context είναι ουσιαστικά η προσβαση στην DB μου
public class CompanyDao(MyTurnContext context)
{
  // task είναι ο τύπος για το await. λέμε ουσιαστικα οτι όταν ολοκληρωθεί το async o τυπος θα είναι List<Company>
  public async Task<List<Company>> GetAll()
  {
    try
    {
      return await context.Companies
        .AsNoTracking()
        .ToListAsync();
    }
    catch (Exception error)
    {
      throw new Exception($"DAO: Failed to fetch companies, {error.Message}", error);
    }
  }

  // ο superAdmin έχει προσβαση σε όλες τις εταιρίες. ο Admin έχει πρόσβαση μόνο στις εταιριες που έχει δημιουργήσει ο ίδιος
  // Η ίδια μέθοδος χρησιμοποιείται πλέον και από STAFF:
  // επιστρέφει γενικά τις Companies με τις οποίες ο User έχει CompanyUser relation.
  public async Task<List<Company>> GetByUserId(int userId)
  {
    try
    {
      return await context.Companies
        .AsNoTracking()
        .Where(company =>
          context.CompanyUsers.Any(companyUser =>
            companyUser.UserId == userId &&
            companyUser.CompanyId == company.Id
          )
        )
        .ToListAsync();
    }
    catch (Exception error)
    {
      throw new Exception(
        $"DAO: Failed to fetch user's companies, {error.Message}",
        error
      );
    }
  }

  public async Task<Company?> GetById(int id)
  {
    try
    {
      return await context.Companies.FindAsync(id);
    }
    catch (Exception error)
    {
      throw new Exception($"DAO: Failed to fetch company, {error.Message}", error);
    }
  }

  public async Task<Company> Create(Company company)
  {
    try
    {
      context.Companies.Add(company);
      await context.SaveChangesAsync();
      return company;
    }
    catch (Exception error)
    {
      throw new Exception($"DAO: Failed to create company, {error.Message}", error);
    }
  }

  public async Task<Company?> Update(int id, Company updatedData)
  {
    try
    {
      var company = await context.Companies.FindAsync(id);
      if (company is null)
      {
        Console.WriteLine("DAO: company was not found to be updated");
        return null;
      }

      company.Name = updatedData.Name;
      company.UpdatedAt = DateTime.UtcNow;

      await context.SaveChangesAsync();
      return company;
    }
    catch (Exception error)
    {
      throw new Exception($"DAO: Failed to update company, {error.Message}", error);
    }
  }

  public async Task<Company?> Delete(int id)
  {
    try
    {
      var company = await context.Companies.FindAsync(id);
      if (company is null)
      {
        Console.WriteLine("DAO: company was not found to be deleted");
        return null;
      }

      context.Companies.Remove(company);
      await context.SaveChangesAsync();
      return company;
    }
    catch (Exception error)
    {
      throw new Exception($"DAO: Failed to delete company, {error.Message}", error);
    }
  }
}