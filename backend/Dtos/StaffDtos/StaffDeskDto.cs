namespace backend.Dtos.StaffDtos;

public sealed record StaffDeskDto(
  int Id,
  string Name,
  int LocationId,
  string LocationName,
  int QueueId,
  string QueueName,
  bool IsActive
);
