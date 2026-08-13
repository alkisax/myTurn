// backend/Controllers/CompanyController.cs

using Backend;
using System.Security.Claims;

namespace backend;

public class CompanyController
{
  private readonly CompanyDao _dao;
  private readonly CompanyUserDao _companyUserDao;

  public CompanyController(
    CompanyDao dao,
    CompanyUserDao companyUserDao
  )
  {
    _dao = dao;
    _companyUserDao = companyUserDao;
  }


  // Ελέγχει αν ο logged-in user έχει πρόσβαση στη συγκεκριμένη company.
  // SUPERADMIN → πάντα πρόσβαση.
  // ADMIN → μόνο αν υπάρχει σχέση CompanyUser.
  private async Task<bool> HasAccess(
    int companyId,
    ClaimsPrincipal currentUser
  )
  {
    var role = currentUser.FindFirst(ClaimTypes.Role)?.Value;

    if (role == "SUPERADMIN")
    {
      return true;
    }

    var userIdString = currentUser.FindFirst("id")?.Value;

    if (!int.TryParse(userIdString, out var userId))
    {
      return false;
    }

    var relation = await _companyUserDao.GetByUserAndCompany(
      userId,
      companyId
    );

    return relation is not null;
  }


  public async Task<IResult> Create(
    CreateCompanyDto dto,
    ClaimsPrincipal currentUser
  )
  {
    try
    {
      var userIdString = currentUser.FindFirst("id")?.Value;

      if (!int.TryParse(userIdString, out var userId))
      {
        return Results.Unauthorized();
      }

      var company = new Company
      {
        Name = dto.Name,
        MissedTicketExpiryMinutes = dto.MissedTicketExpiryMinutes,
        DefaultEstimatedServiceMinutes = dto.DefaultEstimatedServiceMinutes
      };

      var created = await _dao.Create(company);

      // όταν ένας admin δημιουργεί company δημιουργείται αυτόματα
      // η σχέση που του δίνει πρόσβαση σε αυτή
      var companyUser = new CompanyUser
      {
        UserId = userId,
        CompanyId = created.Id
      };

      await _companyUserDao.Create(companyUser);

      var response = new CompanyDto(
        created.Id,
        created.Name,
        created.MissedTicketExpiryMinutes,
        created.DefaultEstimatedServiceMinutes,
        created.CreatedAt
      );

      return Results.Ok(new
      {
        status = true,
        data = response
      });
    }
    catch (Exception ex)
    {
      Console.WriteLine(ex);

      return Results.Problem(
        detail: ex.Message,
        statusCode: 500
      );
    }
  }


  // αυτό είναι το GetAll του SUPERADMIN και επιστρέφει όλες τις companies
  public async Task<IResult> GetAll()
  {
    try
    {
      var companies = await _dao.GetAll();

      var response = companies.Select(company => new CompanyDto(
        company.Id,
        company.Name,
        company.MissedTicketExpiryMinutes,
        company.DefaultEstimatedServiceMinutes,
        company.CreatedAt
      )).ToList();

      return Results.Ok(new
      {
        status = true,
        data = response
      });
    }
    catch (Exception ex)
    {
      Console.WriteLine(ex);

      return Results.Problem(
        detail: ex.Message,
        statusCode: 500
      );
    }
  }


  // έχουμε δυο get all η απο πάνω είναι του super admin και αυτή του απλου admin που βλέπει μόνο τις δικές του
  public async Task<IResult> GetMine(ClaimsPrincipal currentUser)
  {
    try
    {
      var userIdString = currentUser.FindFirst("id")?.Value;

      if (!int.TryParse(userIdString, out var userId))
      {
        return Results.Unauthorized();
      }

      var companies = await _dao.GetByUserId(userId);

      var response = companies.Select(company => new CompanyDto(
        company.Id,
        company.Name,
        company.MissedTicketExpiryMinutes,
        company.DefaultEstimatedServiceMinutes,
        company.CreatedAt
      )).ToList();

      return Results.Ok(new
      {
        status = true,
        data = response
      });
    }
    catch (Exception ex)
    {
      Console.WriteLine(ex);

      return Results.Problem(
        detail: ex.Message,
        statusCode: 500
      );
    }
  }


  public async Task<IResult> GetById(
    int id,
    ClaimsPrincipal currentUser
  )
  {
    try
    {
      var hasAccess = await HasAccess(id, currentUser);

      if (!hasAccess)
      {
        return Results.Forbid();
      }

      var company = await _dao.GetById(id);

      if (company is null)
      {
        return Results.NotFound(new
        {
          status = false,
          message = "Company not found"
        });
      }

      var response = new CompanyDto(
        company.Id,
        company.Name,
        company.MissedTicketExpiryMinutes,
        company.DefaultEstimatedServiceMinutes,
        company.CreatedAt
      );

      return Results.Ok(new
      {
        status = true,
        data = response
      });
    }
    catch (Exception ex)
    {
      Console.WriteLine(ex);

      return Results.Problem(
        detail: ex.Message,
        statusCode: 500
      );
    }
  }


  public async Task<IResult> Update(
    int id,
    UpdateCompanyDto dto,
    ClaimsPrincipal currentUser
  )
  {
    try
    {
      var hasAccess = await HasAccess(id, currentUser);

      if (!hasAccess)
      {
        return Results.Forbid();
      }

      var updatedData = new Company
      {
        Name = dto.Name,
        MissedTicketExpiryMinutes = dto.MissedTicketExpiryMinutes,
        DefaultEstimatedServiceMinutes = dto.DefaultEstimatedServiceMinutes
      };

      var updated = await _dao.Update(id, updatedData);

      if (updated is null)
      {
        return Results.NotFound(new
        {
          status = false,
          message = "Company not found"
        });
      }

      var response = new CompanyDto(
        updated.Id,
        updated.Name,
        updated.MissedTicketExpiryMinutes,
        updated.DefaultEstimatedServiceMinutes,
        updated.CreatedAt
      );

      return Results.Ok(new
      {
        status = true,
        data = response
      });
    }
    catch (Exception ex)
    {
      Console.WriteLine(ex);

      return Results.Problem(
        detail: ex.Message,
        statusCode: 500
      );
    }
  }


  public async Task<IResult> Delete(
    int id,
    ClaimsPrincipal currentUser
  )
  {
    try
    {
      var hasAccess = await HasAccess(id, currentUser);

      if (!hasAccess)
      {
        return Results.Forbid();
      }

      var deleted = await _dao.Delete(id);

      if (deleted is null)
      {
        return Results.NotFound(new
        {
          status = false,
          message = "Company not found"
        });
      }

      var response = new CompanyDto(
        deleted.Id,
        deleted.Name,
        deleted.MissedTicketExpiryMinutes,
        deleted.DefaultEstimatedServiceMinutes,
        deleted.CreatedAt
      );

      return Results.Ok(new
      {
        status = true,
        data = response
      });
    }
    catch (Exception ex)
    {
      Console.WriteLine(ex);

      return Results.Problem(
        detail: ex.Message,
        statusCode: 500
      );
    }
  }
}
