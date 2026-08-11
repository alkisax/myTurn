// backend\Controllers\CompanyUserController.cs

using Backend;
using backend.Dtos.CompanyUserDtos;

namespace backend.Controllers;

public class CompanyUserController
{
  private readonly CompanyUserDao _dao;

  public CompanyUserController(CompanyUserDao dao)
  {
    _dao = dao;
  }

  public async Task<IResult> GetAll()
  {
    var companyUsers = await _dao.GetAll();

    var data = companyUsers.Select(companyUser => new CompanyUserDto(
      companyUser.Id,
      companyUser.UserId,
      companyUser.CompanyId,
      companyUser.CreatedAt
    ));

    return Results.Ok(new
    {
      status = true,
      data
    });
  }

  public async Task<IResult> GetByUserId(int userId)
  {
    var companyUsers = await _dao.GetByUserId(userId);

    var data = companyUsers.Select(companyUser => new CompanyUserDto(
      companyUser.Id,
      companyUser.UserId,
      companyUser.CompanyId,
      companyUser.CreatedAt
    ));

    return Results.Ok(new
    {
      status = true,
      data
    });
  }

  public async Task<IResult> GetByCompanyId(int companyId)
  {
    var companyUsers = await _dao.GetByCompanyId(companyId);

    var data = companyUsers.Select(companyUser => new CompanyUserDto(
      companyUser.Id,
      companyUser.UserId,
      companyUser.CompanyId,
      companyUser.CreatedAt
    ));

    return Results.Ok(new
    {
      status = true,
      data
    });
  }

  public async Task<IResult> Create(CreateCompanyUserDto dto)
  {
    var existing = await _dao.GetByUserAndCompany(dto.UserId, dto.CompanyId);

    if (existing is not null)
    {
      return Results.Conflict(new
      {
        status = false,
        message = "User already belongs to this company"
      });
    }

    var companyUser = new CompanyUser
    {
      UserId = dto.UserId,
      CompanyId = dto.CompanyId
    };

    var created = await _dao.Create(companyUser);

    var data = new CompanyUserDto(
      created.Id,
      created.UserId,
      created.CompanyId,
      created.CreatedAt
    );

    return Results.Created($"/company-users/{created.Id}", new
    {
      status = true,
      data
    });
  }

  public async Task<IResult> Delete(int id)
  {
    var deleted = await _dao.Delete(id);

    if (deleted is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Company-user relation not found"
      });
    }

    return Results.Ok(new
    {
      status = true,
      message = "Company-user relation deleted"
    });
  }
}