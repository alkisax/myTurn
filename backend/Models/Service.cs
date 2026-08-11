// backend\Models\Service.cs
namespace Backend;
public class Service
{
  public int Id { get; set; }
  public int CompanyId { get; set; }
  public int LocationId { get; set; }
  public required string Name { get; set; }
  public string? Description { get; set; }
  public bool IsActive { get; set; } = true;
  public bool IsGeneric { get; set; } = false;
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
  public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}