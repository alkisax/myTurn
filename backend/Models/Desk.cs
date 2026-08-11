// backend\Models\Desk.cs
namespace Backend;

public class Desk
{
  public int Id { get; set; }

  // Το κρατάμε και εδώ για εύκολο company access check.
  // Θα συμπληρώνεται server-side.
  public int CompanyId { get; set; }

  public int LocationId { get; set; }

  // Ένα Desk εξυπηρετεί ένα Queue.
  // Ένα Queue μπορεί να έχει πολλά Desks.
  public int QueueId { get; set; }

  public required string Name { get; set; }

  // Admin-level ενεργοποίηση/απενεργοποίηση του Desk.
  // ΔΕΝ σημαίνει αν αυτή τη στιγμή κάθεται Staff σε αυτό.
  public bool IsActive { get; set; } = true;

  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}