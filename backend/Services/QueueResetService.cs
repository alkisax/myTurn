using Backend;

namespace backend.Services;

public class QueueResetService(
  LocationDao locationDao,
  TicketDao ticketDao,
  QueueDao queueDao
)
{
  public async Task EnsureResetIfNeeded(Queue queue)
  {
    if (!queue.AutoResetEnabled || queue.ResetAt is null)
    {
      return;
    }

    var location = await locationDao.GetById(queue.LocationId);

    if (string.IsNullOrWhiteSpace(location?.TimeZoneId))
    {
      return;
    }

    TimeZoneInfo timeZone;

    try
    {
      timeZone = TimeZoneInfo.FindSystemTimeZoneById(location.TimeZoneId);
    }
    catch (TimeZoneNotFoundException)
    {
      return;
    }
    catch (InvalidTimeZoneException)
    {
      return;
    }

    var nowUtc = DateTime.UtcNow;
    var localNow = TimeZoneInfo.ConvertTimeFromUtc(nowUtc, timeZone);
    var scheduledLocal = localNow.Date + queue.ResetAt.Value.ToTimeSpan();

    if (localNow < scheduledLocal)
    {
      scheduledLocal = scheduledLocal.AddDays(-1);
    }

    var scheduledUtc = TimeZoneInfo.ConvertTimeToUtc(
      DateTime.SpecifyKind(scheduledLocal, DateTimeKind.Unspecified),
      timeZone
    );

    if (nowUtc < scheduledUtc ||
        (queue.LastResetAt is not null && queue.LastResetAt >= scheduledUtc))
    {
      return;
    }

    await ticketDao.ExpireWaitingAndMissedByQueueId(queue.Id);
    await queueDao.SaveLastResetAt(queue, nowUtc, queue.ResetNumberDaily);
  }
}
