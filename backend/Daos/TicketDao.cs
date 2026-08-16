// backend\Daos\TicketDao.cs

using Backend;
using System.Data;
using Microsoft.EntityFrameworkCore;

namespace backend;

public record ClaimNextWaitingResult(Ticket? Ticket, bool AlreadyServing);

public class TicketDao(MyTurnContext context)
{
  // create ticket in 3 parts
  // 1. Βρες τον τελευταίο αριθμό της Queue σήμερα
  // 2. Έλεγξε αν ένα PIN χρησιμοποιείται ήδη σήμερα στο Location
  // 3. Αποθήκευσε το Ticket

  // 1. Βρίσκει τον μεγαλύτερο αριθμό που έχει εκδοθεί
  // σήμερα για συγκεκριμένο Queue.
  public async Task<int> GetLastNumberToday(int queueId)
  {
    var today = DateTime.UtcNow.Date;
    var tomorrow = today.AddDays(1);

    var lastNumber = await context.Tickets
      // βρίσκουμε το εισιτήριο που: έχει το σωστο queue έχει δημιουργηθεί σημερα και οχι αύριο
      .Where(ticket =>
        ticket.QueueId == queueId &&
        ticket.CreatedAt >= today &&
        ticket.CreatedAt < tomorrow
      )
      // μου επιστρέφει το μέγιστο με βάση τον α/α
      .MaxAsync(ticket => (int?)ticket.Number);

    return lastNumber ?? 0;
  }

  // 2. Ελέγχει αν το συγκεκριμένο PIN έχει ήδη χρησιμοποιηθεί
  // σήμερα στο συγκεκριμένο Location.
  public async Task<bool> PinExistsToday(
    int locationId,
    string pin
  )
  {
    var today = DateTime.UtcNow.Date;
    var tomorrow = today.AddDays(1);

    return await context.Tickets
      // το .Where θα μου επέστρεφε λιστα, ενώ το AnyAsync μου απαντάει ναι/οχι
      // αν υπάρχει εισιτήριο με ιδιο location που έχει ίδιο πιν και έχει εκδοθεί μετα απο σημερα και πριν απο αυριο
      .AnyAsync(ticket =>
        ticket.LocationId == locationId &&
        ticket.Pin == pin &&
        ticket.CreatedAt >= today &&
        ticket.CreatedAt < tomorrow
      );
  }

  // 3. Αποθηκεύει το νέο Ticket μαζί με τα Services του σαν μία atomic διαδικασία.
  // Atomic σημαίνει "όλα ή τίποτα". Θέλουμε: 1. να δημιουργηθεί το Ticket 2. να δημιουργηθούν ΟΛΑ τα TicketService. Αν αποτύχει οποιοδήποτε βήμα, δεν θέλουμε να μείνει στη βάση ούτε Ticket χωρίς services ούτε μισές TicketService εγγραφές.
  // Επίσης κλειδώνουμε τη write διαδικασία από την αρχή ώστε δύο requests να μην πάρουν τον ίδιο ticket number.
  public async Task<Ticket> Create(
    Ticket ticket,
    List<int> serviceIds,
    Queue queue
  )
  {
    // ⚠️ BEGIN IMMEDIATE = ξεκίνα transaction και πάρε write access από τώρα. Έτσι άλλο create request δεν μπορεί ταυτόχρονα να διαβάσει τον ίδιο τελευταίο αριθμό και να δημιουργήσει duplicate Number.
    // Serializable στον SQLite provider ξεκινά write transaction (BEGIN IMMEDIATE).
    // Το EF γνωρίζει το transaction και δεν ανοίγει δεύτερο στο SaveChangesAsync.
    await using var transaction = await context.Database.BeginTransactionAsync(
      IsolationLevel.Serializable
    );

    try
    {
      // 1. Βρίσκουμε τον τελευταίο αριθμό όσο το transaction είναι κλειδωμένο.
      var lastNumber = await context.Tickets
        .Where(ticketDb =>
          ticketDb.QueueId == ticket.QueueId &&
          (queue.LastNumberResetAt == null ||
           ticketDb.CreatedAt >= queue.LastNumberResetAt)
        )
        .MaxAsync(ticketDb => (int?)ticketDb.Number);


      // 2. Δίνουμε τον επόμενο αριθμό.
      ticket.Number = (lastNumber ?? 0) + 1;


      // 3. Αποθηκεύουμε πρώτα το Ticket για να πάρουμε το Id του.
      context.Tickets.Add(ticket);
      await context.SaveChangesAsync();

      // 4: Δημιουργούμε μία TicketService εγγραφή για κάθε Service που επέλεξε ο χρήστης.
      foreach (var serviceId in serviceIds)
      {
        var ticketService = new TicketService
        {
          TicketId = ticket.Id,
          ServiceId = serviceId
        };

        context.TicketServices.Add(ticketService);
      }

      // Αποθηκεύουμε όλες τις TicketService εγγραφές.
      await context.SaveChangesAsync();

      // COMMIT: Όλα τα παραπάνω πέτυχαν. Κάνουμε τις αλλαγές οριστικές στη βάση.
      await transaction.CommitAsync();
      return ticket;
    }
    catch
    {
      // Αν αποτύχει ΟΤΙΔΗΠΟΤΕ μέσα στο try → ROLLBACK: ακυρώνουμε ΟΛΕΣ τις αλλαγές του transaction.
      // Ακόμα και αν το Ticket είχε ήδη περάσει από SaveChangesAsync(), δεν θα παραμείνει στη βάση επειδή δεν είχε γίνει COMMIT.
      await transaction.RollbackAsync();
      throw;
    }
  }

  // για να μπορούμε να παρακολουθούμε το ticket απο σελίδα που μας οδηγεί το qr
  public async Task<Ticket?> GetByTrackingToken(
    string trackingToken
  )
  {
    return await context.Tickets
      .AsNoTracking()
      .FirstOrDefaultAsync(ticket =>
        ticket.TrackingToken == trackingToken
      );
  }

  // για να μπορεί να δεί ο χρήστης τα ticket του παλια και νέα
  public async Task<List<Ticket>> GetByUserId(int userId)
  {
    return await context.Tickets
      .AsNoTracking()
      .Where(ticket => ticket.UserId == userId)
      .OrderByDescending(ticket => ticket.CreatedAt)
      .ToListAsync();
  }

  // για όλο το προσωπικό να βλέπει ποιοι αριθμοί είναι σε ένα queue. Το staff βλέπει το queue στο οποίο είναι assigned, ο admin τα queue του company και ο super admin όλα
  // όλα τα tickets του queue αργότερα filter
  public async Task<List<Ticket>> GetByQueueId(
    int queueId,
    DateTime? lastResetAt
  )
  {
    return await context.Tickets
      .AsNoTracking()
      .Where(ticket =>
        ticket.QueueId == queueId &&
        (lastResetAt == null || ticket.CreatedAt >= lastResetAt) &&
        (ticket.Status == "WAITING" ||
         ticket.Status == "SERVING" ||
         ticket.Status == "MISSED")
      )
      .OrderBy(ticket => ticket.Number)
      .ToListAsync();
  }

  public async Task<Ticket?> GetServingByStaffAndDesk(
    int userId,
    int deskId,
    int queueId
  )
  {
    return await context.Tickets
      .AsNoTracking()
      .FirstOrDefaultAsync(ticket =>
        ticket.Status == "SERVING" &&
        ticket.ServedByUserId == userId &&
        ticket.ServedAtDeskId == deskId &&
        ticket.QueueId == queueId
      );
  }

  public async Task<List<Ticket>> GetServingByLocationId(int locationId)
  {
    return await context.Tickets
      .AsNoTracking()
      .Where(ticket =>
        ticket.LocationId == locationId &&
        ticket.Status == "SERVING"
      )
      .OrderBy(ticket => ticket.QueueId)
      .ThenBy(ticket => ticket.ServedAtDeskId)
      .ToListAsync();
  }

  public async Task<List<Ticket>> GetHistoryByQueueId(int queueId)
  {
    return await context.Tickets
      .AsNoTracking()
      .Where(ticket => ticket.QueueId == queueId)
      .OrderByDescending(ticket => ticket.CreatedAt)
      .ToListAsync();
  }

  // οταν ο staff πατάει το κουμπι "next"
  // Βρίσκει το πρώτο WAITING ticket της Queue.
  // αυτη η συναρτηση είναι legacy λογο racing conditions
  public async Task<Ticket?> GetNextWaiting(int queueId)
  {
    return await context.Tickets
      .Where(ticket =>
        ticket.QueueId == queueId &&
        ticket.Status == "WAITING"
      )
      .OrderBy(ticket => ticket.Number)
      .FirstOrDefaultAsync();
  }

  // Η GetNextWaiting είχε race condition: δύο STAFF μπορούσαν σχεδόν ταυτόχρονα να διαβάσουν το ίδιο WAITING ticket.
  // Η ClaimNextWaiting κάνει:
  // 1. "κλείδωσε" τη δυνατότητα για άλλο writer
  // 2. βρες το επόμενο WAITING ticket 3. κάν' το SERVING 4. αποθήκευσε Staff + Desk
  // 5. commit
  // Έτσι το SELECT + UPDATE αντιμετωπίζονται σαν μία ενιαία διαδικασία.
  public async Task<ClaimNextWaitingResult> ClaimNextWaiting(
    int queueId,
    int userId,
    int deskId
  )
  {
    // ExecuteSqlRawAsync: εκτελεί απευθείας SQL command στη SQLite.
    // BEGIN IMMEDIATE: ξεκινάει transaction και ζητάει αμέσως write access.
    // Η ιδέα είναι: "Από εδώ μέχρι το COMMIT/ROLLBACK, άσε εμένα να ολοκληρώσω αυτή τη write διαδικασία."
    // Αν δύο STAFF πατήσουν Next σχεδόν ταυτόχρονα, ο δεύτερος writer δεν θα μπορεί να κάνει την ίδια διαδικασία την ίδια στιγμή.
    await context.Database.ExecuteSqlRawAsync(
      "BEGIN IMMEDIATE;"
    );

    try
    {
      var alreadyServing = await context.Tickets.AnyAsync(ticket =>
        ticket.Status == "SERVING" &&
        (ticket.ServedByUserId == userId ||
         ticket.ServedAtDeskId == deskId)
      );

      if (alreadyServing)
      {
        await context.Database.ExecuteSqlRawAsync("COMMIT;");
        return new ClaimNextWaitingResult(null, true);
      }

      // Ψάχνουμε το επόμενο ticket της συγκεκριμένης Queue.
      var ticket = await context.Tickets

        // WHERE QueueId = queueId AND Status = 'WAITING'
        .Where(ticket =>
          ticket.QueueId == queueId &&
          ticket.Status == "WAITING"
        )
        // ORDER BY Number ASC
        .OrderBy(ticket => ticket.Number)
        // Πάρε το πρώτο αποτέλεσμα. Αν δεν υπάρχει κανένα WAITING ticket, επιστρέφει null.
        .FirstOrDefaultAsync();

      // Δεν υπάρχει κανένας πελάτης σε αναμονή.
      if (ticket is null)
      {
        // Παρόλο που δεν αλλάξαμε κάτι, πρέπει να κλείσουμε το transaction που ανοίξαμε.
        // COMMIT = ολοκλήρωσε επιτυχώς το transaction.
        await context.Database.ExecuteSqlRawAsync("COMMIT;");
        return new ClaimNextWaitingResult(null, false);
      }

      // Από εδώ και πέρα έχουμε βρει το ticket που "κέρδισε" αυτός ο STAFF.
      // WAITING -> SERVING
      ticket.Status = "SERVING";

      // Ποιος STAFF πήρε το ticket.
      // Το userId έρχεται από το StaffSession / JWT flow και όχι από τον client.
      ticket.ServedByUserId = userId;

      // Σε ποιο Desk εξυπηρετείται.
      ticket.ServedAtDeskId = deskId;

      // Πότε ξεκίνησε πραγματικά η εξυπηρέτηση.
      ticket.ServingStartedAt = DateTime.UtcNow;

      // Timestamp τελευταίας αλλαγής του ticket.
      ticket.UpdatedAt = DateTime.UtcNow;

      // Το EF Core βλέπει ότι αλλάξαμε properties του entity "ticket" και παράγει το αντίστοιχο UPDATE SQL.
      await context.SaveChangesAsync();

      // Όλα πήγαν καλά.
      // COMMIT: κάνε οριστικές όλες τις αλλαγές του transaction.
      await context.Database.ExecuteSqlRawAsync("COMMIT;");

      // Επιστρέφουμε το ticket πλέον ενημερωμένο: Status = SERVING κλπ.
      return new ClaimNextWaitingResult(ticket, false);
    }
    catch
    {
      // catch χωρίς "(Exception ex)" σημαίνει: "πιάσε οποιοδήποτε exception". Αν κάτι αποτύχει μετά το BEGIN IMMEDIATE δεν θέλουμε να μείνει μισοτελειωμένη η διαδικασία.

      // ROLLBACK: ακύρωσε όλες τις αλλαγές που έγιναν από το BEGIN IMMEDIATE μέχρι εδώ.
      await context.Database.ExecuteSqlRawAsync("ROLLBACK;");
      throw;
    }
  }

  // γενικό update. 
  // το προσθέσαμε εδω πρώτη φορα γιατι θα το χρησιμοποιήσει ο controller για να κάνει στο next το status waiting → SERVING
  // Αργότερα η ίδια Update() μπορεί να χρησιμοποιηθεί και για: SERVING → COMPLETED, WAITING → MISSED, WAITING → CANCELLED, MISSED → EXPIRED
  public async Task<Ticket?> Update(
    int id,
    Ticket updatedData
  )
  {
    var ticket = await context.Tickets.FindAsync(id);

    if (ticket is null)
    {
      return null;
    }

    ticket.Status = updatedData.Status;
    ticket.ServedByUserId = updatedData.ServedByUserId;
    ticket.ServedAtDeskId = updatedData.ServedAtDeskId;
    ticket.ServingStartedAt = updatedData.ServingStartedAt;
    ticket.UpdatedAt = DateTime.UtcNow;

    await context.SaveChangesAsync();
    return ticket;
  }

  // Ολοκληρώνει ένα ticket που αυτή τη στιγμή εξυπηρετει ο συγκεκριμένος STAFF στο συγκεκριμένο Desk.
  // Ελέγχουμε μέσα στο query: - σωστό ticket id - Status == SERVING - το ticket εξυπηρετείται από αυτόν τον STAFF - στο Desk του τρέχοντος StaffSession
  public async Task<Ticket?> Complete(
    int ticketId,
    int userId,
    int deskId,
    string completionResult
  )
  {
    var ticket = await context.Tickets
      .FirstOrDefaultAsync(ticket =>
        ticket.Id == ticketId &&
        ticket.Status == "SERVING" &&
        ticket.ServedByUserId == userId &&
        ticket.ServedAtDeskId == deskId
      );

    if (ticket is null) return null;

    // SERVING -> COMPLETED
    ticket.Status = "COMPLETED";
    // Αποθηκεύουμε το αποτέλεσμα της εξυπηρέτησης. SUCCESS ή FAILED.
    ticket.CompletionResult = completionResult;
    ticket.CompletedAt = DateTime.UtcNow;
    ticket.UpdatedAt = DateTime.UtcNow;

    await context.SaveChangesAsync();
    return ticket;
  }

  // SERVING -> MISSED
  // Μόνο το ticket που εξυπηρετεί αυτή τη στιγμή ο συγκεκριμένος STAFF στο συγκεκριμένο Desk.
  public async Task<Ticket?> MarkMissed(
    int ticketId,
    int userId,
    int deskId
  )
  {
    var ticket = await context.Tickets
      .FirstOrDefaultAsync(ticket =>
        ticket.Id == ticketId &&
        ticket.Status == "SERVING" &&
        ticket.ServedByUserId == userId &&
        ticket.ServedAtDeskId == deskId
      );

    if (ticket is null) return null;

    ticket.Status = "MISSED";
    ticket.MissedAt = DateTime.UtcNow;
    ticket.UpdatedAt = DateTime.UtcNow;

    await context.SaveChangesAsync();
    return ticket;
  }

  // MISSED -> SERVING
  // Το ticket παραμένει με τον ίδιο αριθμό. Δεν δημιουργούμε νέο ticket.
  public async Task<Ticket?> RecallMissed(
    int ticketId,
    int queueId,
    int userId,
    int deskId
  )
  {
    var ticket = await context.Tickets
      .FirstOrDefaultAsync(ticket =>
        ticket.Id == ticketId &&
        ticket.QueueId == queueId &&
        ticket.Status == "MISSED"
      );

    if (ticket is null) return null;

    ticket.Status = "SERVING";
    // Ο STAFF που κάνει recall γίνεται ο τωρινός server.
    ticket.ServedByUserId = userId;
    ticket.ServedAtDeskId = deskId;
    // Νέα έναρξη εξυπηρέτησης.
    ticket.ServingStartedAt = DateTime.UtcNow;
    ticket.UpdatedAt = DateTime.UtcNow;

    await context.SaveChangesAsync();
    return ticket;
  }

  public async Task<Ticket?> GetById(int id)
  {
    return await context.Tickets
      .AsNoTracking()
      .FirstOrDefaultAsync(ticket => ticket.Id == id);
  }

  // MISSED -> EXPIRED
  // Χρησιμοποιείται όταν έχει περάσει το χρονικό περιθώριο μέσα στο οποίο μπορούσε να γίνει recall.
  // ⚠️ Αυτό αργότερα πιθανότατα δεν θα πατιέται από άνθρωπο. Θα το κάνει background process μετά από Χ λεπτά.
  public async Task<Ticket?> ExpireMissed(
    int ticketId
  )
  {
    var ticket = await context.Tickets
      .FirstOrDefaultAsync(ticket =>
        ticket.Id == ticketId &&
        ticket.Status == "MISSED"
      );

    if (ticket is null) return null;

    ticket.Status = "EXPIRED";
    ticket.ExpiredAt = DateTime.UtcNow;
    ticket.UpdatedAt = DateTime.UtcNow;

    await context.SaveChangesAsync();
    return ticket;
  }

  public async Task<int> ExpireMissedByQueueId(
    int queueId,
    DateTime cutoffUtc
  )
  {
    var now = DateTime.UtcNow;

    return await context.Tickets
      .Where(ticket =>
        ticket.QueueId == queueId &&
        ticket.Status == "MISSED" &&
        ticket.MissedAt <= cutoffUtc
      )
      .ExecuteUpdateAsync(setters => setters
        .SetProperty(ticket => ticket.Status, "EXPIRED")
        .SetProperty(ticket => ticket.ExpiredAt, now)
        .SetProperty(ticket => ticket.UpdatedAt, now)
      );
  }

  // WAITING/MISSED -> EXPIRED for a manual Queue reset.
  public async Task<int> ExpireWaitingAndMissedByQueueId(int queueId)
  {
    var now = DateTime.UtcNow;

    return await context.Tickets
      .Where(ticket =>
        ticket.QueueId == queueId &&
        (ticket.Status == "WAITING" || ticket.Status == "MISSED")
      )
      .ExecuteUpdateAsync(setters => setters
        .SetProperty(ticket => ticket.Status, "EXPIRED")
        .SetProperty(ticket => ticket.ExpiredAt, now)
        .SetProperty(ticket => ticket.UpdatedAt, now)
      );
  }

  // WAITING -> CANCELLED
  public async Task<Ticket?> Cancel(
    int ticketId,
    int userId
  )
  {
    var ticket = await context.Tickets
      .FirstOrDefaultAsync(ticket =>
        ticket.Id == ticketId &&
        ticket.UserId == userId &&
        ticket.Status == "WAITING"
      );

    if (ticket is null) return null;

    ticket.Status = "CANCELLED";
    ticket.CancelledAt = DateTime.UtcNow;
    ticket.UpdatedAt = DateTime.UtcNow;

    await context.SaveChangesAsync();
    return ticket;
  }

  // SUPERADMIN hard delete.
  // Χρησιμοποιείται μόνο για administrative recovery / cleanup.
  public async Task<Ticket?> Delete(int ticketId)
  {
    var ticket = await context.Tickets.FindAsync(ticketId);

    if (ticket is null)
    {
      return null;
    }

    context.Tickets.Remove(ticket);
    await context.SaveChangesAsync();

    return ticket;
  }

  // Παίρνουμε τα τελευταία έως 15 completed tickets της queue, μέσα στην τρέχουσα operational period για να υπολογίσουμε το estimated time
  public async Task<List<Ticket>> GetRecentCompletedByQueueId(
    int queueId,
    DateTime? lastResetAt,
    int limit = 15
  )
  {
    return await context.Tickets
      .AsNoTracking()
      .Where(ticket =>
        ticket.QueueId == queueId &&
        ticket.Status == "COMPLETED" &&
        ticket.ServingStartedAt != null &&
        ticket.CompletedAt != null &&
        (lastResetAt == null || ticket.CreatedAt >= lastResetAt)
      )
      .OrderByDescending(ticket => ticket.CompletedAt)
      .Take(limit)
      .ToListAsync();
  }

  // ελέγχει πόσα νουμερα είναι waiting απο το ενεργό ως αυτό που έχουμε
  public async Task<List<Ticket>> GetWaitingAhead(
  int queueId,
  int ticketNumber,
  DateTime? lastResetAt
)
  {
    return await context.Tickets
      .AsNoTracking()
      .Where(ticket =>
        ticket.QueueId == queueId &&
        ticket.Status == "WAITING" &&
        ticket.Number < ticketNumber &&
        (lastResetAt == null || ticket.CreatedAt >= lastResetAt)
      )
      .OrderBy(ticket => ticket.Number)
      .ToListAsync();
  }

}
