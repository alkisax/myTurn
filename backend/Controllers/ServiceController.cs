// backend\Controllers\ServiceController.cs
using Backend;
using backend.Dtos.ServiceDtos;
using System.Security.Claims;
namespace backend.Controllers;
public class ServiceController
{
  private readonly ServiceDao _dao;
  private readonly LocationDao _locationDao;
  private readonly CompanyUserDao _companyUserDao;
  public ServiceController(
    ServiceDao dao,
    LocationDao locationDao,
    CompanyUserDao companyUserDao
  )
  {
    _dao = dao;
    _locationDao = locationDao;
    _companyUserDao = companyUserDao;
  }
  private async Task<bool> HasCompanyAccess(
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
  public async Task<IResult> GetAll()
  {
    var services = await _dao.GetAll();
    return Results.Ok(new
    {
      status = true,
      data = services.Select(MapToDto)
    });
  }
  public async Task<IResult> GetById(
    int id,
    ClaimsPrincipal currentUser
  )
  {
    var service = await _dao.GetById(id);
    if (service is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Service not found"
      });
    }
    var hasAccess = await HasCompanyAccess(
      service.CompanyId,
      currentUser
    );
    if (!hasAccess)
    {
      return Results.Forbid();
    }
    return Results.Ok(new
    {
      status = true,
      data = MapToDto(service)
    });
  }
  public async Task<IResult> GetByLocationId(
    int locationId,
    ClaimsPrincipal currentUser
  )
  {
    var location = await _locationDao.GetById(locationId);
    if (location is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Location not found"
      });
    }
    var hasAccess = await HasCompanyAccess(
      location.CompanyId,
      currentUser
    );
    if (!hasAccess)
    {
      return Results.Forbid();
    }
    var services = await _dao.GetByLocationId(locationId);
    return Results.Ok(new
    {
      status = true,
      data = services.Select(MapToDto)
    });
  }
  public async Task<IResult> GetByCompanyId(
    int companyId,
    ClaimsPrincipal currentUser
  )
  {
    var hasAccess = await HasCompanyAccess(
      companyId,
      currentUser
    );
    if (!hasAccess)
    {
      return Results.Forbid();
    }
    var services = await _dao.GetByCompanyId(companyId);
    return Results.Ok(new
    {
      status = true,
      data = services.Select(MapToDto)
    });
  }
  public async Task<IResult> Create(
    CreateServiceDto dto,
    ClaimsPrincipal currentUser
  )
  {
    var location = await _locationDao.GetById(dto.LocationId);
    if (location is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Location not found"
      });
    }
    var hasAccess = await HasCompanyAccess(
      location.CompanyId,
      currentUser
    );
    if (!hasAccess)
    {
      return Results.Forbid();
    }
    var service = new Service
    {
      CompanyId = location.CompanyId,
      LocationId = location.Id,
      Name = dto.Name,
      Description = dto.Description,
      IsGeneric = dto.IsGeneric,
      EstimatedServiceMinutes = dto.EstimatedServiceMinutes
    };
    var created = await _dao.Create(service);
    return Results.Created($"/services/{created.Id}", new
    {
      status = true,
      data = MapToDto(created)
    });
  }
  public async Task<IResult> Update(
    int id,
    UpdateServiceDto dto,
    ClaimsPrincipal currentUser
  )
  {
    var service = await _dao.GetById(id);
    if (service is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Service not found"
      });
    }
    var hasAccess = await HasCompanyAccess(
      service.CompanyId,
      currentUser
    );
    if (!hasAccess)
    {
      return Results.Forbid();
    }
    service.Name = dto.Name ?? service.Name;
    service.Description = dto.Description ?? service.Description;
    service.IsActive = dto.IsActive ?? service.IsActive;
    service.IsGeneric = dto.IsGeneric ?? service.IsGeneric;
    service.EstimatedServiceMinutes = dto.EstimatedServiceMinutes ?? service.EstimatedServiceMinutes;
    var updated = await _dao.Update(id, service);
    return Results.Ok(new
    {
      status = true,
      data = MapToDto(updated!)
    });
  }
  public async Task<IResult> Delete(
    int id,
    ClaimsPrincipal currentUser
  )
  {
    var service = await _dao.GetById(id);
    if (service is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Service not found"
      });
    }
    var hasAccess = await HasCompanyAccess(
      service.CompanyId,
      currentUser
    );
    if (!hasAccess)
    {
      return Results.Forbid();
    }
    var deleted = await _dao.Delete(id);
    return Results.Ok(new
    {
      status = true,
      message = $"Service {deleted!.Name} deleted"
    });
  }
  private static ServiceDto MapToDto(Service service)
  {
    return new ServiceDto(
      service.Id,
      service.CompanyId,
      service.LocationId,
      service.Name,
      service.Description,
      service.IsActive,
      service.IsGeneric,
      service.EstimatedServiceMinutes,
      service.CreatedAt,
      service.UpdatedAt
    );
  }
}