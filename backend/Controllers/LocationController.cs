// backend\Controllers\LocationController.cs

using Backend;
using backend.Dtos.LocationDtos;

namespace backend.Controllers;

public class LocationController
{
  private readonly LocationDao _dao;

  public LocationController(LocationDao dao)
  {
    _dao = dao;
  }

  public async Task<IResult> GetAll()
  {
    var locations = await _dao.GetAll();

    var data = locations.Select(location => new LocationDto(
      location.Id,
      location.CompanyId,
      location.Name,
      location.Address,
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

  public async Task<IResult> GetById(int id)
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

    var data = new LocationDto(
      location.Id,
      location.CompanyId,
      location.Name,
      location.Address,
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

  public async Task<IResult> GetByCompanyId(int companyId)
  {
    var locations = await _dao.GetByCompanyId(companyId);

    var data = locations.Select(location => new LocationDto(
      location.Id,
      location.CompanyId,
      location.Name,
      location.Address,
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

  public async Task<IResult> Create(CreateLocationDto dto)
  {
    var location = new Location
    {
      CompanyId = dto.CompanyId,
      Name = dto.Name,
      Address = dto.Address
    };

    var created = await _dao.Create(location);

    var data = new LocationDto(
      created.Id,
      created.CompanyId,
      created.Name,
      created.Address,
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

  public async Task<IResult> Update(int id, UpdateLocationDto dto)
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

    location.Name = dto.Name ?? location.Name;
    location.Address = dto.Address ?? location.Address;
    location.IsActive = dto.IsActive ?? location.IsActive;

    var updated = await _dao.Update(id, location);

    var data = new LocationDto(
      updated!.Id,
      updated.CompanyId,
      updated.Name,
      updated.Address,
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

  public async Task<IResult> Delete(int id)
  {
    var deleted = await _dao.Delete(id);

    if (deleted is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Location not found"
      });
    }

    return Results.Ok(new
    {
      status = true,
      message = $"Location {deleted.Name} deleted"
    });
  }
}