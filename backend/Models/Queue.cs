// backend\Models\Queue.cs

namespace Backend;

public class Queue
{
  public int Id { get; set; }

  public int CompanyId { get; set; }

  public int LocationId { get; set; }

  public required string Name { get; set; }

  public string? Description { get; set; }

  public bool IsActive { get; set; } = true;

  public bool IsRemoteTicketingAllowed { get; set; } = true;

  public int? DefaultServiceMinutes { get; set; }

  public int? MaxWaitingTickets { get; set; }

  public TimeOnly? OpensAt { get; set; }

  public TimeOnly? ClosesAt { get; set; }

  public bool ResetNumberDaily { get; set; } = true;

  public bool AutoResetEnabled { get; set; } = false;

  public TimeOnly? ResetAt { get; set; }

  public DateTime? LastResetAt { get; set; }

  public DateTime? LastNumberResetAt { get; set; }

  public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

  public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

  public ICollection<Service> Services { get; set; } = new List<Service>();
}
