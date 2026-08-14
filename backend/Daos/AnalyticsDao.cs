using Backend;
using Microsoft.EntityFrameworkCore;

namespace backend;

public class AnalyticsDao(MyTurnContext context)
{
  private static readonly string[] TicketStatuses =
    ["WAITING", "SERVING", "COMPLETED", "MISSED", "EXPIRED", "CANCELLED"];

  public async Task<CompanyOverviewResult> GetCompanyOverview(int companyId)
  {
    var counts = await context.Tickets.AsNoTracking()
      .Where(ticket => ticket.CompanyId == companyId)
      .GroupBy(ticket => ticket.Status)
      .Select(group => new StatusCountResult { Status = group.Key, Count = group.Count() })
      .ToListAsync();

    return new CompanyOverviewResult
    {
      TotalTickets = counts.Sum(item => item.Count),
      WaitingTickets = CountStatus(counts, "WAITING"),
      ServingTickets = CountStatus(counts, "SERVING"),
      CompletedTickets = CountStatus(counts, "COMPLETED"),
      MissedTickets = CountStatus(counts, "MISSED"),
      ExpiredTickets = CountStatus(counts, "EXPIRED"),
      CancelledTickets = CountStatus(counts, "CANCELLED"),
      ActiveStaffCount = await context.StaffSessions.AsNoTracking()
        .Where(session => session.CompanyId == companyId && session.Status == "ACTIVE" && session.EndedAt == null)
        .Select(session => session.UserId)
        .Distinct()
        .CountAsync()
    };
  }

  public async Task<List<TicketsByHourResult>> GetTicketsByHour(int companyId)
  {
    var groupedTickets = await context.Tickets.AsNoTracking()
    .Where(ticket => ticket.CompanyId == companyId)
    .GroupBy(ticket => new { ticket.CreatedAt.Year, ticket.CreatedAt.Month, ticket.CreatedAt.Day, ticket.CreatedAt.Hour })
    .Select(group => new HourGroupResult
    {
      Year = group.Key.Year, Month = group.Key.Month, Day = group.Key.Day, Hour = group.Key.Hour,
      Count = group.Count()
    })
    .ToListAsync();

    return groupedTickets
      .Select(item => new TicketsByHourResult
      {
        Hour = new DateTime(item.Year, item.Month, item.Day, item.Hour, 0, 0, DateTimeKind.Utc),
        Count = item.Count
      })
      .OrderBy(item => item.Hour)
      .ToList();
  }

  public async Task<List<TicketsByStaffResult>> GetTicketsByStaff(int companyId)
  {
    var servedTickets = await context.Tickets.AsNoTracking()
    .Where(ticket => ticket.CompanyId == companyId && ticket.ServedByUserId != null)
    .Join(context.Users.AsNoTracking(), ticket => ticket.ServedByUserId, user => user.Id,
      (ticket, user) => new { ticket, user })
    .Select(item => new
    {
      UserId = item.user.Id, item.user.Username, item.user.Name, item.ticket.Status, item.ticket.CompletionResult,
      item.ticket.ServingStartedAt, item.ticket.CompletedAt
    })
    .ToListAsync();

    return servedTickets
      .GroupBy(item => new { item.UserId, item.Username, item.Name })
      .Select(group => new TicketsByStaffResult
      {
        UserId = group.Key.UserId,
        Username = group.Key.Username,
        Name = group.Key.Name,
        TotalServed = group.Count(),
        Completed = group.Count(item => item.Status == "COMPLETED"),
        Success = group.Count(item => item.CompletionResult == "SUCCESS"),
        Failed = group.Count(item => item.CompletionResult == "FAILED"),
        Missed = group.Count(item => item.Status == "MISSED"),
        AverageServiceMinutes = group
          .Where(item => item.ServingStartedAt != null && item.CompletedAt != null)
          .Select(item => (item.CompletedAt!.Value - item.ServingStartedAt!.Value).TotalMinutes)
          .DefaultIfEmpty()
          .Average()
      })
      .OrderBy(item => item.Username)
      .ToList();
  }

  public Task<List<TicketsByServiceResult>> GetTicketsByService(int companyId) => context.TicketServices.AsNoTracking()
    .Join(context.Tickets.AsNoTracking().Where(ticket => ticket.CompanyId == companyId), link => link.TicketId, ticket => ticket.Id, (link, ticket) => link)
    .Join(context.Services.AsNoTracking().Where(service => service.CompanyId == companyId), link => link.ServiceId, service => service.Id,
      (link, service) => service)
    .GroupBy(service => new { ServiceId = service.Id, ServiceName = service.Name })
    .Select(group => new TicketsByServiceResult { ServiceId = group.Key.ServiceId, ServiceName = group.Key.ServiceName, TicketCount = group.Count() })
    .OrderBy(item => item.ServiceName).ToListAsync();

  public Task<List<TicketsByLocationResult>> GetTicketsByLocation(int companyId) => context.Locations.AsNoTracking()
    .Where(location => location.CompanyId == companyId)
    .GroupJoin(context.Tickets.AsNoTracking().Where(ticket => ticket.CompanyId == companyId), location => location.Id, ticket => ticket.LocationId,
      (location, tickets) => new TicketsByLocationResult
      {
        LocationId = location.Id, LocationName = location.Name, TicketCount = tickets.Count(),
        CompletedCount = tickets.Count(ticket => ticket.Status == "COMPLETED"), MissedCount = tickets.Count(ticket => ticket.Status == "MISSED"),
        ExpiredCount = tickets.Count(ticket => ticket.Status == "EXPIRED")
      }).OrderBy(item => item.LocationName).ToListAsync();

  public Task<List<TicketsByQueueResult>> GetTicketsByQueue(int companyId) => context.Queues.AsNoTracking()
    .Where(queue => queue.CompanyId == companyId)
    .GroupJoin(context.Tickets.AsNoTracking().Where(ticket => ticket.CompanyId == companyId), queue => queue.Id, ticket => ticket.QueueId,
      (queue, tickets) => new TicketsByQueueResult
      {
        QueueId = queue.Id, QueueName = queue.Name, TicketCount = tickets.Count(), WaitingCount = tickets.Count(ticket => ticket.Status == "WAITING"),
        ServingCount = tickets.Count(ticket => ticket.Status == "SERVING"), CompletedCount = tickets.Count(ticket => ticket.Status == "COMPLETED"),
        MissedCount = tickets.Count(ticket => ticket.Status == "MISSED"), ExpiredCount = tickets.Count(ticket => ticket.Status == "EXPIRED")
      }).OrderBy(item => item.QueueName).ToListAsync();

  public Task<List<PeakHourResult>> GetPeakHours(int companyId) => context.Tickets.AsNoTracking()
    .Where(ticket => ticket.CompanyId == companyId)
    .GroupBy(ticket => ticket.CreatedAt.Hour)
    .Select(group => new PeakHourResult { Hour = group.Key, TicketCount = group.Count() })
    .OrderByDescending(item => item.TicketCount).ThenBy(item => item.Hour).ToListAsync();

  public async Task<CompletionStatsResult> GetCompletionStats(int companyId)
  {
    var counts = await context.Tickets.AsNoTracking().Where(ticket => ticket.CompanyId == companyId)
      .GroupBy(ticket => ticket.Status).Select(group => new StatusCountResult { Status = group.Key, Count = group.Count() }).ToListAsync();
    return new CompletionStatsResult
    {
      TotalTickets = counts.Sum(item => item.Count), Completed = CountStatus(counts, "COMPLETED"), Success = await CountResult(companyId, "SUCCESS"),
      Failed = await CountResult(companyId, "FAILED"), Missed = CountStatus(counts, "MISSED"), Expired = CountStatus(counts, "EXPIRED"), Cancelled = CountStatus(counts, "CANCELLED")
    };
  }

  private async Task<int> CountResult(int companyId, string result) => await context.Tickets.AsNoTracking().CountAsync(ticket => ticket.CompanyId == companyId && ticket.CompletionResult == result);
  private static int CountStatus(IEnumerable<StatusCountResult> values, string status) => values.FirstOrDefault(item => item.Status == status)?.Count ?? 0;
}

public class CompanyOverviewResult { public int TotalTickets { get; set; } public int WaitingTickets { get; set; } public int ServingTickets { get; set; } public int CompletedTickets { get; set; } public int MissedTickets { get; set; } public int ExpiredTickets { get; set; } public int CancelledTickets { get; set; } public int ActiveStaffCount { get; set; } }
public class TicketsByHourResult { public DateTime Hour { get; set; } public int Count { get; set; } }
public class HourGroupResult { public int Year { get; set; } public int Month { get; set; } public int Day { get; set; } public int Hour { get; set; } public int Count { get; set; } }
public class TicketsByStaffResult { public int UserId { get; set; } public string Username { get; set; } = ""; public string? Name { get; set; } public int TotalServed { get; set; } public int Completed { get; set; } public int Success { get; set; } public int Failed { get; set; } public int Missed { get; set; } public double? AverageServiceMinutes { get; set; } }
public class TicketsByServiceResult { public int ServiceId { get; set; } public string ServiceName { get; set; } = ""; public int TicketCount { get; set; } }
public class TicketsByLocationResult { public int LocationId { get; set; } public string LocationName { get; set; } = ""; public int TicketCount { get; set; } public int CompletedCount { get; set; } public int MissedCount { get; set; } public int ExpiredCount { get; set; } }
public class TicketsByQueueResult { public int QueueId { get; set; } public string QueueName { get; set; } = ""; public int TicketCount { get; set; } public int WaitingCount { get; set; } public int ServingCount { get; set; } public int CompletedCount { get; set; } public int MissedCount { get; set; } public int ExpiredCount { get; set; } }
public class PeakHourResult { public int Hour { get; set; } public int TicketCount { get; set; } }
public class CompletionStatsResult { public int TotalTickets { get; set; } public int Completed { get; set; } public int Success { get; set; } public int Failed { get; set; } public int Missed { get; set; } public int Expired { get; set; } public int Cancelled { get; set; } public double CompletionRate { get; set; } }
public class StatusCountResult { public string Status { get; set; } = ""; public int Count { get; set; } }
