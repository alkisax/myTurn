// backend\Models\Location.cs

namespace Backend;

public class Location
{
  public int Id { get; set; }

  public int CompanyId { get; set; }

  public required string Name { get; set; }
  
  public string Slug { get; set; } = string.Empty;

  public string? Address { get; set; }

  public string? Country { get; set; }

  public double? Latitude { get; set; }

  public double? Longitude { get; set; }

  // Expected format is an IANA timezone identifier (for example, Europe/Athens); the application runs on Linux.
  public string? TimeZoneId { get; set; }

  public bool IsActive { get; set; } = true;

  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
