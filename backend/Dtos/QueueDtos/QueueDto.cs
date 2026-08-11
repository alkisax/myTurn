// backend\Dtos\QueueDtos\QueueDto.cs

namespace backend.Dtos.QueueDtos;

public record QueueDto(
  int Id,
  int CompanyId,
  int LocationId,
  string Name,
  string? Description,
  bool IsActive,
  bool IsRemoteTicketingAllowed,
  int? DefaultServiceMinutes,
  int? MaxWaitingTickets,
  TimeOnly? OpensAt,
  TimeOnly? ClosesAt,
  bool ResetNumberDaily,
  DateTime CreatedAt,
  DateTime UpdatedAt
);