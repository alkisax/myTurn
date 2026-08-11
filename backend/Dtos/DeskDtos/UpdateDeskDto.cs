// backend\Dtos\DeskDtos\UpdateDeskDto.cs
namespace backend.Dtos.DeskDtos;

public record UpdateDeskDto(
  string? Name,
  bool? IsActive,
  int? QueueId
);