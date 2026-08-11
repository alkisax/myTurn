// backend\Dtos\StaffSessionDtos\StaffSessionDto.cs
namespace backend.Dtos.StaffSessionDtos;

public record StaffSessionDto(
  int Id,
  int UserId,
  int CompanyId,
  int LocationId,
  int QueueId,
  int DeskId,
  string Status,
  DateTime StartedAt,
  DateTime? BreakStartedAt,
  int TotalBreakSeconds,
  DateTime? EndedAt,
  DateTime CreatedAt,
  DateTime UpdatedAt
);