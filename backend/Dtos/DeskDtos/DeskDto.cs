
// backend\Dtos\DeskDtos\DeskDto.csnamespace backend.Dtos.DeskDtos;

public record DeskDto(
  int Id,
  int CompanyId,
  int LocationId,
  int QueueId,
  string Name,
  bool IsActive,
  DateTime CreatedAt,
  DateTime UpdatedAt
);