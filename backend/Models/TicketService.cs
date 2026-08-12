// backend\Models\TicketService.cs
namespace Backend;

public class TicketService
{
  public int Id { get; set; }
  public int TicketId { get; set; }
  public int ServiceId { get; set; }
  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

