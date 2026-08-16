namespace backend.Dtos.PublicDtos;

public record PublicServiceDto(
  int Id,
  string Name,
  string? Description,
  int? EstimatedServiceMinutes,
  bool IsGeneric
);
