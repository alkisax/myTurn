// backend\Models\Ticket.cs

namespace Backend;

public class Ticket
{
  public int Id { get; set; }

  // Snapshot της δομής στην οποία εκδόθηκε το ticket.
  public int CompanyId { get; set; }

  public int LocationId { get; set; }

  public int QueueId { get; set; }

  // Αν ο πελάτης είναι logged-in USER.
  // Anonymous πελάτης → null.
  public int? UserId { get; set; }

  // Προαιρετικό και για anonymous και για registered user.
  public string? CustomerEmail { get; set; }

  // Ο αριθμός που βλέπει ο πελάτης.
  // π.χ. 42
  public int Number { get; set; }

  // PIN επιβεβαίωσης.
  public required string Pin { get; set; }

  // Τυχαίο secure token για το public tracking URL / QR.
  public required string TrackingToken { get; set; }

  // WAITING
  // SERVING
  // COMPLETED
  // MISSED
  // CANCELLED
  // EXPIRED
  public string Status { get; set; } = "WAITING";

  // Συμπληρώνονται όταν αρχίσει η εξυπηρέτηση.
  public int? ServedByUserId { get; set; }

  public int? ServedAtDeskId { get; set; }

  // SUCCESS / FAILED
  // Έχει τιμή μόνο όταν Status == COMPLETED.
  public string? CompletionResult { get; set; }

  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  public DateTime? ServingStartedAt { get; set; }

  public DateTime? CompletedAt { get; set; }

  public DateTime? MissedAt { get; set; }

  public DateTime? CancelledAt { get; set; }

  public DateTime? ExpiredAt { get; set; }

  public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}