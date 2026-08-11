// backend\Dtos\QueueDtos\UpdateQueueDto.cs

namespace backend.Dtos.QueueDtos;

public record UpdateQueueDto(
  string? Name,
  string? Description,
  bool? IsActive,
  bool? IsRemoteTicketingAllowed,
  int? DefaultServiceMinutes,
  int? MaxWaitingTickets,
  TimeOnly? OpensAt,
  TimeOnly? ClosesAt,
  bool? ResetNumberDaily
);