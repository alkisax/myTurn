// backend\auth\Models\User.cs
namespace backend.auth.Models;
// γιατι έχω model και dto που μοιάζουν να κάνουν τα ίδια? Θα μπορούσε να πεις κανεις οτι το Model είναι το πραγματικό αντικείμενο και τα dto η ταυτότητα του. Επίσης φτιαχνουμε πολλά διαφορετικά dto για την ίδια οντότητα αναλογα με το τι θέλουμε να φέρουμε και τι να κρύψουμε. πχ create, update, summary dto.  Το DTO είναι η μορφή με την οποία επιτρέπω στα δεδομένα να μπουν ή να βγουν από το API
public class User
{
  public int Id { get; set; }
  public required string Username { get; set; }
  public string? Name { get; set; }
  public string? Email { get; set; }
  public string Role { get; set; } = "USER";
  public required string HashedPassword { get; set; }
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
  public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
