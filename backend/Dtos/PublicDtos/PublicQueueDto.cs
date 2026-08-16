namespace backend.Dtos.PublicDtos;

public record PublicQueueDto(
  int Id,
  string Name,
  string? Description,
  bool IsActive,
  bool IsRemoteTicketingAllowed,
  TimeOnly? OpensAt,
  TimeOnly? ClosesAt
);
