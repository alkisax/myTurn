// backend\Models\Company.cs

namespace Backend;

public class Company
{
  public int Id { get; set; }
  public required string Name { get; set; }
  public int MissedTicketExpiryMinutes { get; set; } = 10;
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
  public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
  public int DefaultEstimatedServiceMinutes  { get; set; } = 5;
}
