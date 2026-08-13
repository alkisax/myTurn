// backend\Controllers\LocationController.cs

using Backend;
using backend.Dtos.LocationDtos;
using System.Security.Claims;

namespace backend.Controllers;

public class LocationController
{
  private readonly LocationDao _dao;
  private readonly CompanyUserDao _companyUserDao;

  public LocationController(
    LocationDao dao,
    CompanyUserDao companyUserDao
  )
  {
    _dao = dao;
    _companyUserDao = companyUserDao;
  }


  // Ελέγχει αν ο logged-in user έχει πρόσβαση στη συγκεκριμένη Company.
  // SUPERADMIN → πάντα πρόσβαση.
  // ADMIN → μόνο αν υπάρχει σχέση CompanyUser.
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


  // Όλα τα locations - για SUPERADMIN
  public async Task<IResult> GetAll()
  {
    var locations = await _dao.GetAll();

    var data = locations.Select(location => new LocationDto(
      location.Id,
      location.CompanyId,
      location.Name,
      location.Address,
      location.Country,
      location.Latitude,
      location.Longitude,
      location.TimeZoneId,
      location.IsActive,
      location.CreatedAt,
      location.UpdatedAt
    ));

    return Results.Ok(new
    {
      status = true,
      data
    });
  }


  // Τα locations των companies στις οποίες έχει πρόσβαση ο ADMIN
  public async Task<IResult> GetMine(ClaimsPrincipal currentUser)
  {
    var userIdString = currentUser.FindFirst("id")?.Value;

    if (!int.TryParse(userIdString, out var userId))
    {
      return Results.Unauthorized();
    }

    var locations = await _dao.GetByUserId(userId);

    var data = locations.Select(location => new LocationDto(
      location.Id,
      location.CompanyId,
      location.Name,
      location.Address,
      location.Country,
      location.Latitude,
      location.Longitude,
      location.TimeZoneId,
      location.IsActive,
      location.CreatedAt,
      location.UpdatedAt
    ));

    return Results.Ok(new
    {
      status = true,
      data
    });
  }


  public async Task<IResult> GetById(
    int id,
    ClaimsPrincipal currentUser
  )
  {
    var location = await _dao.GetById(id);

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

    var data = new LocationDto(
      location.Id,
      location.CompanyId,
      location.Name,
      location.Address,
      location.Country,
      location.Latitude,
      location.Longitude,
      location.TimeZoneId,
      location.IsActive,
      location.CreatedAt,
      location.UpdatedAt
    );

    return Results.Ok(new
    {
      status = true,
      data
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

    var locations = await _dao.GetByCompanyId(companyId);

    var data = locations.Select(location => new LocationDto(
      location.Id,
      location.CompanyId,
      location.Name,
      location.Address,
      location.Country,
      location.Latitude,
      location.Longitude,
      location.TimeZoneId,
      location.IsActive,
      location.CreatedAt,
      location.UpdatedAt
    ));

    return Results.Ok(new
    {
      status = true,
      data
    });
  }


  public async Task<IResult> Create(
    CreateLocationDto dto,
    ClaimsPrincipal currentUser
  )
  {
    var hasAccess = await HasCompanyAccess(
      dto.CompanyId,
      currentUser
    );

    if (!hasAccess)
    {
      return Results.Forbid();
    }

    var location = new Location
    {
      CompanyId = dto.CompanyId,
      Name = dto.Name,
      Address = dto.Address,
      Country = dto.Country,
      Latitude = dto.Latitude,
      Longitude = dto.Longitude,
      TimeZoneId = dto.TimeZoneId
    };

    var created = await _dao.Create(location);

    var data = new LocationDto(
      created.Id,
      created.CompanyId,
      created.Name,
      created.Address,
      created.Country,
      created.Latitude,
      created.Longitude,
      created.TimeZoneId,
      created.IsActive,
      created.CreatedAt,
      created.UpdatedAt
    );

    return Results.Created($"/locations/{created.Id}", new
    {
      status = true,
      data
    });
  }


  public async Task<IResult> Update(
    int id,
    UpdateLocationDto dto,
    ClaimsPrincipal currentUser
  )
  {
    var location = await _dao.GetById(id);

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

    location.Name = dto.Name ?? location.Name;
    location.Address = dto.Address ?? location.Address;
    location.Country = dto.Country ?? location.Country;
    location.Latitude = dto.Latitude ?? location.Latitude;
    location.Longitude = dto.Longitude ?? location.Longitude;
    location.TimeZoneId = dto.TimeZoneId ?? location.TimeZoneId;
    location.IsActive = dto.IsActive ?? location.IsActive;

    var updated = await _dao.Update(id, location);

    var data = new LocationDto(
      updated!.Id,
      updated.CompanyId,
      updated.Name,
      updated.Address,
      updated.Country,
      updated.Latitude,
      updated.Longitude,
      updated.TimeZoneId,
      updated.IsActive,
      updated.CreatedAt,
      updated.UpdatedAt
    );

    return Results.Ok(new
    {
      status = true,
      data
    });
  }


  public async Task<IResult> Delete(
    int id,
    ClaimsPrincipal currentUser
  )
  {
    var location = await _dao.GetById(id);

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

    var deleted = await _dao.Delete(id);

    return Results.Ok(new
    {
      status = true,
      message = $"Location {deleted!.Name} deleted"
    });
  }
}
