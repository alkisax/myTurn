// backend\Daos\QueueDao.cs

using Backend;
using Microsoft.EntityFrameworkCore;

namespace backend;

public class QueueDao(MyTurnContext context)
{
  // SUPERADMIN use-case:
  // επιστρέφει όλα τα queues της εφαρμογής
  public async Task<List<Queue>> GetAll()
  {
    return await context.Queues
      .AsNoTracking()
      .ToListAsync();
  }

  // Χρήσιμο όταν θέλουμε συγκεκριμένο queue
  // Το αν ο ADMIN έχει δικαίωμα να το δει
  // ΔΕΝ ελέγχεται εδώ αλλά στον Controller.
  public async Task<Queue?> GetById(int id)
  {
    return await context.Queues.FindAsync(id);
  }

  // ADMIN:
  // χρησιμοποιείται για να δει ποια queues υπάρχουν
  // σε συγκεκριμένο Location.
  //
  // ΠΡΟΣΟΧΗ:
  // Το DAO απλά κάνει query με LocationId.
  // Ο Controller πρέπει ΠΡΙΝ το καλέσει να ελέγξει
  // ότι το Location ανήκει σε Company του logged-in ADMIN.
  public async Task<List<Queue>> GetByLocationId(int locationId)
  {
    return await context.Queues
      .AsNoTracking()
      .Where(queue => queue.LocationId == locationId)
      .ToListAsync();
  }

  // Προαιρετικά χρήσιμο:
  // όλα τα queues μιας Company.
  //
  // Και εδώ το authorization θα γίνει στον Controller.
  public async Task<List<Queue>> GetByCompanyId(int companyId)
  {
    return await context.Queues
      .AsNoTracking()
      .Where(queue => queue.CompanyId == companyId)
      .ToListAsync();
  }

  // ADMIN δημιουργεί Queue.
  //
  // Το DAO ΔΕΝ αποφασίζει CompanyId.
  // Ο Controller θα:
  // 1. βρει το Location
  // 2. ελέγξει access
  // 3. πάρει Location.CompanyId
  // 4. δημιουργήσει το Queue
  public async Task<Queue> Create(Queue queue)
  {
    context.Queues.Add(queue);
    await context.SaveChangesAsync();
    return queue;
  }

  public async Task<Queue?> Update(int id, Queue updatedData)
  {
    var queue = await context.Queues.FindAsync(id);

    if (queue is null)
    {
      return null;
    }

    queue.Name = updatedData.Name;
    queue.Description = updatedData.Description;
    queue.IsActive = updatedData.IsActive;
    queue.IsRemoteTicketingAllowed = updatedData.IsRemoteTicketingAllowed;
    queue.DefaultServiceMinutes = updatedData.DefaultServiceMinutes;
    queue.MaxWaitingTickets = updatedData.MaxWaitingTickets;
    queue.OpensAt = updatedData.OpensAt;
    queue.ClosesAt = updatedData.ClosesAt;
    queue.ResetNumberDaily = updatedData.ResetNumberDaily;
    queue.AutoResetEnabled = updatedData.AutoResetEnabled;
    queue.ResetAt = updatedData.ResetAt;
    queue.UpdatedAt = DateTime.UtcNow;

    await context.SaveChangesAsync();
    return queue;
  }

  public async Task<Queue?> Delete(int id)
  {
    var queue = await context.Queues.FindAsync(id);

    if (queue is null)
    {
      return null;
    }

    context.Queues.Remove(queue);
    await context.SaveChangesAsync();
    return queue;
  }

  public async Task SaveLastResetAt(
    Queue queue,
    DateTime lastResetAt,
    bool updateLastNumberResetAt = false
  )
  {
    queue.LastResetAt = lastResetAt;

    if (updateLastNumberResetAt)
    {
      queue.LastNumberResetAt = lastResetAt;
    }

    queue.UpdatedAt = lastResetAt;
    await context.SaveChangesAsync();
  }
}
