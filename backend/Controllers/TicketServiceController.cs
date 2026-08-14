// backend/Controllers/TicketServiceController.cs

using backend.Dtos.TicketServiceDtos;
using System.Security.Claims;

namespace backend.Controllers;

public class TicketServiceController
{
  private readonly TicketServiceDao _ticketServiceDao;
  private readonly TicketDao _ticketDao;
  private readonly ServiceDao _serviceDao;
  private readonly CompanyUserDao _companyUserDao;

  public TicketServiceController(
    TicketServiceDao ticketServiceDao,
    TicketDao ticketDao,
    ServiceDao serviceDao,
    CompanyUserDao companyUserDao
  )
  {
    _ticketServiceDao = ticketServiceDao;
    _ticketDao = ticketDao;
    _serviceDao = serviceDao;
    _companyUserDao = companyUserDao;
  }

  private async Task<bool> HasCompanyAccess(
    int companyId,
    ClaimsPrincipal currentUser
  )
  {
    var role = currentUser.FindFirst(ClaimTypes.Role)?.Value;
    if (role == "SUPERADMIN") return true;
    if (role != "ADMIN") return false;
    if (!int.TryParse(currentUser.FindFirst("id")?.Value, out var userId)) return false;
    return await _companyUserDao.GetByUserAndCompany(userId, companyId) is not null;
  }


  // Εδώ πρέπει να ελέγξουμε ότι: -υπάρχει το Ticket -υπάρχει το Service -το Service είναι στο ίδιο Location με το Ticket -το Service είναι ενεργό
  public async Task<IResult> Create(
    int ticketId,
    int serviceId,
    ClaimsPrincipal currentUser
  )
  {
    var ticket = await _ticketDao.GetById(ticketId);

    if (ticket is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Ticket not found"
      });
    }

    if (!await HasCompanyAccess(ticket.CompanyId, currentUser))
    {
      return Results.Forbid();
    }

    var service = await _serviceDao.GetById(serviceId);

    if (service is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Service not found"
      });
    }

    // Το service πρέπει να ανήκει στο ίδιο location με το ticket.
    if (service.LocationId != ticket.LocationId)
    {
      return Results.BadRequest(new
      {
        status = false,
        message = "Service does not belong to the ticket location"
      });
    }

    if (!service.IsActive)
    {
      return Results.BadRequest(new
      {
        status = false,
        message = "Service is inactive"
      });
    }

    var ticketService = await _ticketServiceDao.Create(
      ticketId,
      serviceId
    );

    var data = new TicketServiceDto(
      ticketService.Id,
      ticketService.TicketId,
      ticketService.ServiceId,
      ticketService.CreatedAt
    );

    return Results.Ok(new
    {
      status = true,
      data
    });
  }

  public async Task<IResult> GetByTicketId(int ticketId, ClaimsPrincipal currentUser)
  {
    var ticket = await _ticketDao.GetById(ticketId);

    if (ticket is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Ticket not found"
      });
    }

    if (!await HasCompanyAccess(ticket.CompanyId, currentUser))
    {
      return Results.Forbid();
    }

    var ticketServices = await _ticketServiceDao.GetByTicketId(ticketId);

    var data = ticketServices
      .Select(ts => new TicketServiceDto(
        ts.Id,
        ts.TicketId,
        ts.ServiceId,
        ts.CreatedAt
      ))
      .ToList();

    return Results.Ok(new
    {
      status = true,
      data
    });
  }

  public async Task<IResult> Delete(
  int ticketId,
  int serviceId,
  ClaimsPrincipal currentUser
)
  {
    var ticket = await _ticketDao.GetById(ticketId);
    if (ticket is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Ticket not found"
      });
    }

    if (!await HasCompanyAccess(ticket.CompanyId, currentUser))
    {
      return Results.Forbid();
    }

    var ticketService = await _ticketServiceDao.Delete(
      ticketId,
      serviceId
    );

    if (ticketService is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Ticket service relation not found"
      });
    }

    return Results.Ok(new
    {
      status = true,
      message = "Service removed from ticket"
    });
  }

  public async Task<IResult> DeleteByTicketId(int ticketId, ClaimsPrincipal currentUser)
  {
    var ticket = await _ticketDao.GetById(ticketId);
    if (ticket is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Ticket not found"
      });
    }

    if (!await HasCompanyAccess(ticket.CompanyId, currentUser))
    {
      return Results.Forbid();
    }

    var deletedCount = await _ticketServiceDao.DeleteByTicketId(ticketId);
    return Results.Ok(new
    {
      status = true,
      deletedCount
    });
  }

  public async Task<IResult> GetByServiceId(int serviceId, ClaimsPrincipal currentUser)
  {
    var service = await _serviceDao.GetById(serviceId);

    if (service is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Service not found"
      });
    }

    if (!await HasCompanyAccess(service.CompanyId, currentUser))
    {
      return Results.Forbid();
    }

    var ticketServices = await _ticketServiceDao.GetByServiceId(serviceId);

    var data = ticketServices
      .Select(ts => new TicketServiceDto(
        ts.Id,
        ts.TicketId,
        ts.ServiceId,
        ts.CreatedAt
      ))
      .ToList();

    return Results.Ok(new
    {
      status = true,
      data
    });
  }
}
