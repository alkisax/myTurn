// backend/Services/TicketEstimateService.cs

using Backend;

namespace backend.Services;

public class TicketEstimateService(
  TicketServiceDao ticketServiceDao,
  CompanyDao companyDao,
  TicketDao ticketDao,
  StaffSessionDao staffSessionDao
)
{
  public async Task<int> GetConfiguredDurationMinutes(Ticket ticket)
  {
    var company = await companyDao.GetById(ticket.CompanyId);

    if (company is null) return 0;

    return await ticketServiceDao.GetConfiguredDurationMinutes(
      ticket.Id,
      company.DefaultEstimatedServiceMinutes
    );
  }

  public async Task<double> GetAverageActualServiceMinutes(
    int queueId,
    DateTime? lastResetAt
  )
  {
    var tickets = await ticketDao.GetRecentCompletedByQueueId(
      queueId,
      lastResetAt
    );

    if (tickets.Count == 0) return 0;

    var durations = tickets
      .Select(ticket =>
        (ticket.CompletedAt!.Value -
         ticket.ServingStartedAt!.Value).TotalMinutes
      )
      .ToList();

    return durations.Average();
  }

  public async Task<double> GetAverageConfiguredServiceMinutes(
    int queueId,
    DateTime? lastResetAt
  )
  {
    var tickets = await ticketDao.GetRecentCompletedByQueueId(
      queueId,
      lastResetAt
    );

    if (tickets.Count == 0) return 0;

    var durations = new List<int>();

    foreach (var ticket in tickets)
    {
      var duration = await GetConfiguredDurationMinutes(ticket);
      durations.Add(duration);
    }

    return durations.Average();
  }

  public async Task<double> GetPerformanceFactor(
    int queueId,
    DateTime? lastResetAt
  )
  {
    var actualAverage =
      await GetAverageActualServiceMinutes(queueId, lastResetAt);

    var configuredAverage =
      await GetAverageConfiguredServiceMinutes(queueId, lastResetAt);

    if (actualAverage <= 0 || configuredAverage <= 0)
    {
      return 1;
    }

    return actualAverage / configuredAverage;
  }


  // πχ είμαστε ticket 6 και εκδωσαμε ticket 10  μπροστά: 6 -> 5 λεπτά, 7 -> 8 λεπτά, 9 -> 4 λεπτά, σύνολο = 17 λεπτά
  public async Task<int> GetWaitingAheadConfiguredMinutes(
    Ticket ticket,
    DateTime? lastResetAt
  )
  {
    var waitingAhead = await ticketDao.GetWaitingAhead(
      ticket.QueueId,
      ticket.Number,
      lastResetAt
    );

    var totalMinutes = 0;

    foreach (var waitingTicket in waitingAhead)
    {
      totalMinutes += await GetConfiguredDurationMinutes(waitingTicket);
    }

    return totalMinutes;
  }

  // tickets μπροστά = 17 configured λεπτά, performance factor = 1.5, estimated waiting = 25.5 λεπτά
  public async Task<double> GetAdjustedWaitingMinutes(
    Ticket ticket,
    DateTime? lastResetAt
  )
  {
    var configuredWaitingMinutes =
      await GetWaitingAheadConfiguredMinutes(
        ticket,
        lastResetAt
      );

    var performanceFactor =
      await GetPerformanceFactor(
        ticket.QueueId,
        lastResetAt
      );

    return configuredWaitingMinutes * performanceFactor;
  }

  // τελικη func
  public async Task<double> GetEstimatedWaitingMinutes(
    Ticket ticket,
    DateTime? lastResetAt
  )
  {
    var adjustedWaitingMinutes =
      await GetAdjustedWaitingMinutes(
        ticket,
        lastResetAt
      );

    var activeStaffCount =
      await staffSessionDao.GetActiveCountByQueueId(
        ticket.QueueId
      );

    if (activeStaffCount <= 0)
    {
      return adjustedWaitingMinutes;
    }

    return adjustedWaitingMinutes / activeStaffCount;
  }
}