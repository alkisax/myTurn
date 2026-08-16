using backend.Dtos.PublicDtos;

namespace backend.Controllers;

public class PublicController(
  CompanyDao companyDao,
  LocationDao locationDao,
  QueueDao queueDao,
  ServiceDao serviceDao,
  TicketDao ticketDao,
  DeskDao deskDao
)
{
  public async Task<IResult> GetCompany(string companySlug)
  {
    var company = await companyDao.GetBySlug(companySlug);
    return company is null
      ? Results.NotFound()
      : Results.Ok(new { status = true, data = new PublicCompanyDto(company.Name, company.Slug) });
  }

  public async Task<IResult> GetLocations(string companySlug)
  {
    var company = await companyDao.GetBySlug(companySlug);
    if (company is null) return Results.NotFound();

    var locations = await locationDao.GetByCompanyId(company.Id);
    return Results.Ok(new
    {
      status = true,
      data = locations.Where(location => location.IsActive).Select(MapLocation)
    });
  }

  public async Task<IResult> GetLocation(string companySlug, string locationSlug)
  {
    var location = await ResolveLocation(companySlug, locationSlug);
    return location is null || !location.IsActive
      ? Results.NotFound()
      : Results.Ok(new { status = true, data = MapLocation(location) });
  }

  public async Task<IResult> GetQueues(string companySlug, string locationSlug)
  {
    var location = await ResolveLocation(companySlug, locationSlug);
    if (location is null) return Results.NotFound();

    var queues = await queueDao.GetByLocationId(location.Id);
    return Results.Ok(new
    {
      status = true,
      data = queues.Where(queue => queue.IsActive).Select(queue => new PublicQueueDto(
        queue.Id, queue.Name, queue.Description, queue.IsActive,
        queue.IsRemoteTicketingAllowed, queue.OpensAt, queue.ClosesAt))
    });
  }

  public async Task<IResult> GetServices(string companySlug, string locationSlug)
  {
    var location = await ResolveLocation(companySlug, locationSlug);
    if (location is null) return Results.NotFound();

    var services = await serviceDao.GetByLocationId(location.Id);
    return Results.Ok(new
    {
      status = true,
      data = services.Where(service => service.IsActive).Select(service => new PublicServiceDto(
        service.Id, service.Name, service.Description,
        service.EstimatedServiceMinutes, service.IsGeneric))
    });
  }

  public async Task<IResult> GetServicesByQueue(
    string companySlug,
    string locationSlug,
    int queueId
  )
  {
    var location = await ResolveLocation(companySlug, locationSlug);
    var queue = await queueDao.GetById(queueId);

    if (location is null || queue is null ||
        queue.CompanyId != location.CompanyId || queue.LocationId != location.Id)
    {
      return Results.NotFound();
    }

    var services = await serviceDao.GetActiveByQueueId(queueId);
    return Results.Ok(new
    {
      status = true,
      data = services.Select(service => new PublicServiceDto(
        service.Id, service.Name, service.Description,
        service.EstimatedServiceMinutes, service.IsGeneric))
    });
  }

  public async Task<IResult> GetNowServing(
    string companySlug,
    string locationSlug
  )
  {
    var location = await ResolveLocation(companySlug, locationSlug);

    if (location is null || !location.IsActive)
    {
      return Results.NotFound();
    }

    var tickets = await ticketDao.GetServingByLocationId(location.Id);
    var data = new List<PublicNowServingDto>();

    foreach (var ticket in tickets)
    {
      var queue = await queueDao.GetById(ticket.QueueId);
      var desk = ticket.ServedAtDeskId is null
        ? null
        : await deskDao.GetById(ticket.ServedAtDeskId.Value);

      if (queue is null || desk is null)
      {
        continue;
      }

      data.Add(new PublicNowServingDto(
        ticket.QueueId,
        queue.Name,
        ticket.Number,
        desk.Id,
        desk.Name,
        ticket.ServingStartedAt
      ));
    }

    return Results.Ok(new
    {
      status = true,
      data
    });
  }

  private async Task<Backend.Location?> ResolveLocation(string companySlug, string locationSlug)
  {
    var company = await companyDao.GetBySlug(companySlug);
    return company is null ? null : await locationDao.GetBySlug(company.Id, locationSlug);
  }

  private static PublicLocationDto MapLocation(Backend.Location location) => new(
    location.Id, location.Name, location.Slug, location.Address,
    location.Country, location.IsActive);
}
