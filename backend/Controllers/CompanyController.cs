// backend/Controllers/CompanyController.cs

using Backend;

namespace backend;

public class CompanyController
{
  private readonly CompanyDao _dao;

  public CompanyController(CompanyDao dao)
  {
    _dao = dao;
  }

  public async Task<IResult> Create(CreateCompanyDto dto)
  {
    try
    {
      var company = new Company
      {
        Name = dto.Name
      };

      var created = await _dao.Create(company);

      var response = new CompanyDto(
        created.Id,
        created.Name,
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

  public async Task<IResult> GetAll()
  {
    try
    {
      var companies = await _dao.GetAll();

      var response = companies.Select(company => new CompanyDto(
        company.Id,
        company.Name,
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

  public async Task<IResult> GetById(int id)
  {
    try
    {
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

  public async Task<IResult> Update(int id, CreateCompanyDto dto)
  {
    try
    {
      var updatedData = new Company
      {
        Name = dto.Name
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

  public async Task<IResult> Delete(int id)
  {
    try
    {
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