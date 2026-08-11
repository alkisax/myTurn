// backend\Controllers\QueueController.cs

using Backend;
using backend.Dtos.QueueDtos;
using System.Security.Claims;

namespace backend.Controllers;

public class QueueController
{
  private readonly QueueDao _dao;
  private readonly LocationDao _locationDao;
  private readonly CompanyUserDao _companyUserDao;

  public QueueController(
    QueueDao dao,
    LocationDao locationDao,
    CompanyUserDao companyUserDao
  )
  {
    _dao = dao;
    _locationDao = locationDao;
    _companyUserDao = companyUserDao;
  }


  // Ελέγχει αν ο logged-in user έχει πρόσβαση
  // στη συγκεκριμένη Company.
  //
  // SUPERADMIN → πάντα πρόσβαση
  // ADMIN → μόνο αν υπάρχει CompanyUser relation
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


  // SUPERADMIN → όλα τα queues
  public async Task<IResult> GetAll()
  {
    var queues = await _dao.GetAll();

    var data = queues.Select(queue => MapToDto(queue));

    return Results.Ok(new
    {
      status = true,
      data
    });
  }


  // ADMIN/SUPERADMIN → συγκεκριμένο Queue
  //
  // ✅ ACCESS CHECK:
  // Χρησιμοποιούμε το CompanyId του Queue
  // ώστε ADMIN άλλης Company να πάρει 403.
  public async Task<IResult> GetById(
    int id,
    ClaimsPrincipal currentUser
  )
  {
    var queue = await _dao.GetById(id);

    if (queue is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Queue not found"
      });
    }

    var hasAccess = await HasCompanyAccess(
      queue.CompanyId,
      currentUser
    );

    if (!hasAccess)
    {
      return Results.Forbid();
    }

    return Results.Ok(new
    {
      status = true,
      data = MapToDto(queue)
    });
  }


  // ✅ ADMIN:
  // βλέπει όλα τα queues ενός Location,
  // αλλά μόνο αν το Location ανήκει σε Company
  // στην οποία έχει πρόσβαση.
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

    var queues = await _dao.GetByLocationId(locationId);

    var data = queues.Select(queue => MapToDto(queue));

    return Results.Ok(new
    {
      status = true,
      data
    });
  }


  // ADMIN/SUPERADMIN → όλα τα queues μιας Company
  //
  // ✅ ACCESS CHECK:
  // ADMIN βλέπει μόνο δική του Company.
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

    var queues = await _dao.GetByCompanyId(companyId);

    var data = queues.Select(queue => MapToDto(queue));

    return Results.Ok(new
    {
      status = true,
      data
    });
  }


  // ✅ ADMIN δημιουργεί Queue.
  //
  // ΣΗΜΑΝΤΙΚΟ:
  // Το frontend στέλνει LocationId αλλά ΟΧΙ CompanyId.
  //
  // 1. βρίσκουμε Location
  // 2. παίρνουμε CompanyId από το Location
  // 3. ελέγχουμε access
  // 4. ο server βάζει CompanyId στο Queue
  //
  // Έτσι δεν μπορεί το frontend να στείλει:
  // LocationId από Company A
  // CompanyId από Company B.
  public async Task<IResult> Create(
    CreateQueueDto dto,
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

    var queue = new Queue
    {
      CompanyId = location.CompanyId,
      LocationId = location.Id,
      Name = dto.Name,
      Description = dto.Description,
      DefaultServiceMinutes = dto.DefaultServiceMinutes,
      MaxWaitingTickets = dto.MaxWaitingTickets,
      OpensAt = dto.OpensAt,
      ClosesAt = dto.ClosesAt
    };

    var created = await _dao.Create(queue);

    return Results.Created($"/queues/{created.Id}", new
    {
      status = true,
      data = MapToDto(created)
    });
  }


  // ✅ ADMIN μπορεί να αλλάξει Queue
  // μόνο Company στην οποία έχει access.
  //
  // Δεν επιτρέπουμε αλλαγή CompanyId / LocationId εδώ.
  public async Task<IResult> Update(
    int id,
    UpdateQueueDto dto,
    ClaimsPrincipal currentUser
  )
  {
    var queue = await _dao.GetById(id);

    if (queue is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Queue not found"
      });
    }

    var hasAccess = await HasCompanyAccess(
      queue.CompanyId,
      currentUser
    );

    if (!hasAccess)
    {
      return Results.Forbid();
    }

    queue.Name = dto.Name ?? queue.Name;
    queue.Description = dto.Description ?? queue.Description;
    queue.IsActive = dto.IsActive ?? queue.IsActive;

    queue.IsRemoteTicketingAllowed =
      dto.IsRemoteTicketingAllowed
      ?? queue.IsRemoteTicketingAllowed;

    queue.DefaultServiceMinutes =
      dto.DefaultServiceMinutes
      ?? queue.DefaultServiceMinutes;

    queue.MaxWaitingTickets =
      dto.MaxWaitingTickets
      ?? queue.MaxWaitingTickets;

    queue.OpensAt =
      dto.OpensAt
      ?? queue.OpensAt;

    queue.ClosesAt =
      dto.ClosesAt
      ?? queue.ClosesAt;

    queue.ResetNumberDaily =
      dto.ResetNumberDaily
      ?? queue.ResetNumberDaily;

    var updated = await _dao.Update(id, queue);

    return Results.Ok(new
    {
      status = true,
      data = MapToDto(updated!)
    });
  }


  // ✅ ADMIN διαγράφει Queue
  // μόνο από Company στην οποία έχει access.
  public async Task<IResult> Delete(
    int id,
    ClaimsPrincipal currentUser
  )
  {
    var queue = await _dao.GetById(id);

    if (queue is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Queue not found"
      });
    }

    var hasAccess = await HasCompanyAccess(
      queue.CompanyId,
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
      message = $"Queue {deleted!.Name} deleted"
    });
  }


  // Mapper για να μη γράφουμε συνέχεια
  // new QueueDto(...) σε κάθε method.
  private static QueueDto MapToDto(Queue queue)
  {
    return new QueueDto(
      queue.Id,
      queue.CompanyId,
      queue.LocationId,
      queue.Name,
      queue.Description,
      queue.IsActive,
      queue.IsRemoteTicketingAllowed,
      queue.DefaultServiceMinutes,
      queue.MaxWaitingTickets,
      queue.OpensAt,
      queue.ClosesAt,
      queue.ResetNumberDaily,
      queue.CreatedAt,
      queue.UpdatedAt
    );
  }
}