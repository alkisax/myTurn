// backend\Models\Location.cs

namespace Backend;

public class Location
{
  public int Id { get; set; }

  public int CompanyId { get; set; }

  public required string Name { get; set; }

  public string? Address { get; set; }

  public bool IsActive { get; set; } = true;

  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}