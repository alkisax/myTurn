// backend\Models\StaffSession.cs

namespace Backend;

/*
  StaffSession

  Αυτή η οντότητα καταγράφει πότε ένας STAFF εργάζεται σε συγκεκριμένο Desk.

  Παράδειγμα:

    Staff Maria
      → μπαίνει στο Desk 1 στις 09:00
      → ACTIVE
      → κάνει BREAK στις 11:00
      → επιστρέφει ACTIVE στις 11:15
      → τελειώνει τη βάρδια στις 14:00

  Δεν βάζουμε StaffId μέσα στο Desk, γιατί ο Staff που χρησιμοποιεί
  ένα Desk μπορεί να αλλάζει πολλές φορές.

  Το UserId δείχνει ποιος STAFF εργάζεται.
  Το DeskId δείχνει πού εργάζεται.

  Κρατάμε επίσης CompanyId, LocationId και QueueId ως snapshot
  του session. Έτσι, ακόμη και αν αργότερα το Desk αλλάξει Queue,
  το ιστορικό session παραμένει σωστό.

  Το Status αφορά την τρέχουσα κατάσταση του session:
    ACTIVE
    BREAK

  Όταν ο STAFF φύγει από το Desk, συμπληρώνεται EndedAt.
*/

public class StaffSession
{
  public int Id { get; set; }

  public int UserId { get; set; }

  public int CompanyId { get; set; }

  public int LocationId { get; set; }

  public int QueueId { get; set; }

  public int DeskId { get; set; }

  public string Status { get; set; } = "ACTIVE";

  public DateTime StartedAt { get; set; } = DateTime.UtcNow;

  // Αν βρίσκεται αυτή τη στιγμή σε break.
  public DateTime? BreakStartedAt { get; set; }

  // Συνολικός χρόνος break μέσα σε αυτό το session.
  public int TotalBreakSeconds { get; set; } = 0;

  public DateTime? EndedAt { get; set; }

  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}