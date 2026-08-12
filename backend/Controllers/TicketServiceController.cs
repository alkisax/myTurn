// backend/Controllers/TicketServiceController.cs

using backend.Daos;
using backend.Dtos.TicketServiceDtos;

namespace backend.Controllers;

public class TicketServiceController
{
  private readonly TicketServiceDao _ticketServiceDao;
  private readonly TicketDao _ticketDao;
  private readonly ServiceDao _serviceDao;

  public TicketServiceController(
    TicketServiceDao ticketServiceDao,
    TicketDao ticketDao,
    ServiceDao serviceDao
  )
  {
    _ticketServiceDao = ticketServiceDao;
    _ticketDao = ticketDao;
    _serviceDao = serviceDao;
  }


  // Εδώ πρέπει να ελέγξουμε ότι: -υπάρχει το Ticket -υπάρχει το Service -το Service είναι στο ίδιο Location με το Ticket -το Service είναι ενεργό
  public async Task<IResult> Create(
    int ticketId,
    int serviceId
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

  public async Task<IResult> GetByTicketId(int ticketId)
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
  int serviceId
)
  {
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

  public async Task<IResult> DeleteByTicketId(int ticketId)
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

    var deletedCount = await _ticketServiceDao.DeleteByTicketId(ticketId);
    return Results.Ok(new
    {
      status = true,
      deletedCount
    });
  }

  public async Task<IResult> GetByServiceId(int serviceId)
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