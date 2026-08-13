using backend.Services;

namespace backend.Controllers;

public class TicketPdfController(
  TicketDao ticketDao,
  CompanyDao companyDao,
  LocationDao locationDao,
  QueueDao queueDao,
  TicketServiceDao ticketServiceDao,
  ServiceDao serviceDao,
  TicketEstimateService ticketEstimateService,
  TicketPdfService ticketPdfService
)
{
  public async Task<IResult> GetByTrackingToken(
    string trackingToken
  )
  {
    var ticket =
      await ticketDao.GetByTrackingToken(trackingToken);

    if (ticket is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "Ticket not found"
      });
    }

    var company = await companyDao.GetById(ticket.CompanyId);

    var location = await locationDao.GetById(ticket.LocationId);

    var queue = await queueDao.GetById(ticket.QueueId);

    if (company is null || location is null || queue is null)
    {
      return Results.NotFound();
    }

    var ticketServices = await ticketServiceDao.GetByTicketId(ticket.Id);

    var serviceNames = new List<string>();

    foreach (var ticketService in ticketServices)
    {
      var service =
        await serviceDao.GetById(ticketService.ServiceId);

      if (service is not null)
      {
        serviceNames.Add(service.Name);
      }
    }

    var estimatedWaitingMinutes =
      await ticketEstimateService
        .GetEstimatedWaitingMinutes(
          ticket,
          queue.LastResetAt
        );

    var pdf = ticketPdfService.Generate(
      ticket,
      company.Name,
      location.Name,
      queue.Name,
      serviceNames,
      estimatedWaitingMinutes
    );

    return Results.File(
      pdf,
      "application/pdf",
      $"ticket-{ticket.Number}.pdf"
    );
  }
}