// backend\Controllers\DeskController.cs
using Backend;
using backend.Dtos.DeskDtos;
using backend.Services;
using System.Security.Claims;

namespace backend.Controllers;

public class DeskController
{
  private readonly DeskDao _dao;
  private readonly LocationDao _locationDao;
  private readonly QueueDao _queueDao;
  private readonly CompanyUserDao _companyUserDao;
  private readonly AdministrativeRecoveryService _recoveryService;

  public DeskController(
    DeskDao dao,
    LocationDao locationDao,
    QueueDao queueDao,
    CompanyUserDao companyUserDao,
    AdministrativeRecoveryService recoveryService
  )
  {
    _dao = dao;
    _locationDao = locationDao;
    _queueDao = queueDao;
    _companyUserDao = companyUserDao;
    _recoveryService = recoveryService;
  }


  // SUPERADMIN → πάντα access
  // ADMIN → μόνο αν έχει CompanyUser relation
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


  // SUPERADMIN → όλα τα desks
  public async Task<IResult> GetAll()
  {
    var desks = await _dao.GetAll();

    var data = desks.Select(MapToDto);

    return Results.Ok(new
    {
      status = true,
      data
    });
  }


  // ADMIN → μόνο desk δικής του Company
  public async Task<IResult> GetById(
    int id,
    ClaimsPrincipal currentUser
  )
  {
    var desk = await _dao.GetById(id);

    if (desk is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Desk not found"
      });
    }

    var hasAccess = await HasCompanyAccess(
      desk.CompanyId,
      currentUser
    );

    if (!hasAccess)
    {
      return Results.Forbid();
    }

    return Results.Ok(new
    {
      status = true,
      data = MapToDto(desk)
    });
  }


  // ✅ ADMIN βλέπει τα desks ενός συγκεκριμένου Location
  // μόνο αν το Location ανήκει σε Company του.
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

    var desks = await _dao.GetByLocationId(locationId);

    var data = desks.Select(MapToDto);

    return Results.Ok(new
    {
      status = true,
      data
    });
  }


  // ADMIN → όλα τα desks μιας Company
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

    var desks = await _dao.GetByCompanyId(companyId);

    var data = desks.Select(MapToDto);

    return Results.Ok(new
    {
      status = true,
      data
    });
  }


  // ✅ ADMIN δημιουργεί Desk.
  //
  // Το frontend στέλνει:
  // LocationId
  // QueueId
  //
  // Ο server:
  // 1. βρίσκει Location
  // 2. ελέγχει Company access
  // 3. βρίσκει Queue
  // 4. επιβεβαιώνει ότι Queue και Location ανήκουν μαζί
  // 5. παίρνει CompanyId από το Location
  public async Task<IResult> Create(
    CreateDeskDto dto,
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

    var queue = await _queueDao.GetById(dto.QueueId);

    if (queue is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Queue not found"
      });
    }

    // ✅ Κρίσιμο:
    // δεν μπορεί Desk του Location A
    // να πάρει Queue του Location B.
    if (
      queue.LocationId != location.Id ||
      queue.CompanyId != location.CompanyId
    )
    {
      return Results.BadRequest(new
      {
        status = false,
        message = "Queue does not belong to this location"
      });
    }

    var desk = new Desk
    {
      CompanyId = location.CompanyId,
      LocationId = location.Id,
      QueueId = queue.Id,
      Name = dto.Name
    };

    var created = await _dao.Create(desk);

    return Results.Created($"/desks/{created.Id}", new
    {
      status = true,
      data = MapToDto(created)
    });
  }


  // ADMIN → update μόνο δικού του Desk.
  //
  // LocationId / CompanyId δεν αλλάζουν.
  // QueueId μπορεί να αλλάξει αλλά μόνο σε Queue
  // του ίδιου Location.
  public async Task<IResult> Update(
    int id,
    UpdateDeskDto dto,
    ClaimsPrincipal currentUser
  )
  {
    var desk = await _dao.GetById(id);

    if (desk is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Desk not found"
      });
    }

    var hasAccess = await HasCompanyAccess(
      desk.CompanyId,
      currentUser
    );

    if (!hasAccess)
    {
      return Results.Forbid();
    }

    // Αν ο ADMIN θέλει να αλλάξει Queue.
    if (dto.QueueId is not null)
    {
      var queue = await _queueDao.GetById(dto.QueueId.Value);

      if (queue is null)
      {
        return Results.NotFound(new
        {
          status = false,
          message = "Queue not found"
        });
      }

      if (
        queue.LocationId != desk.LocationId ||
        queue.CompanyId != desk.CompanyId
      )
      {
        return Results.BadRequest(new
        {
          status = false,
          message = "Queue does not belong to this desk's location"
        });
      }

      desk.QueueId = queue.Id;
    }

    desk.Name = dto.Name ?? desk.Name;
    desk.IsActive = dto.IsActive ?? desk.IsActive;

    var updated = await _dao.Update(id, desk);

    return Results.Ok(new
    {
      status = true,
      data = MapToDto(updated!)
    });
  }


  // ADMIN → delete μόνο δικού του Desk.
  public async Task<IResult> Delete(
    int id,
    ClaimsPrincipal currentUser
  )
  {
    var desk = await _dao.GetById(id);

    if (desk is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Desk not found"
      });
    }

    var hasAccess = await HasCompanyAccess(
      desk.CompanyId,
      currentUser
    );

    if (!hasAccess)
    {
      return Results.Forbid();
    }

    if (await _recoveryService.HasOpenDeskSession(id))
    {
      return Results.Conflict(new
      {
        status = false,
        message = "Desk has an open staff session. Force-end the session before deleting the desk."
      });
    }

    var deleted = await _dao.Delete(id);

    return Results.Ok(new
    {
      status = true,
      message = $"Desk {deleted!.Name} deleted"
    });
  }


  private static DeskDto MapToDto(Desk desk)
  {
    return new DeskDto(
      desk.Id,
      desk.CompanyId,
      desk.LocationId,
      desk.QueueId,
      desk.Name,
      desk.IsActive,
      desk.CreatedAt,
      desk.UpdatedAt
    );
  }
}
