// backend\Services\MissedTicketExpiryService.cs
namespace backend.Services;

public class MissedTicketExpiryService(
  TicketDao ticketDao,
  QueueDao queueDao,
  CompanyDao companyDao
)
{
  public async Task<int> EnsureExpiredMissedTickets(int queueId)
  {
    var queue = await queueDao.GetById(queueId);
    if (queue is null) return 0;

    var company = await companyDao.GetById(queue.CompanyId);
    if (company is null) return 0;

    var cutoffUtc = DateTime.UtcNow.AddMinutes(
      -company.MissedTicketExpiryMinutes
    );

    return await ticketDao.ExpireMissedByQueueId(queueId, cutoffUtc);
  }
}
