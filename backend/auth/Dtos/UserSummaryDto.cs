// backend\auth\Dtos\UserSummaryDto.cs
namespace backend.auth.Dtos;

// δεν στέλνει καθόλου password (ούτε Plain Ούτε hashed)
public record UserSummaryDto(
  int Id,
  string Username,
  string? Name,
  string? Email,
  string Role,
  DateTime CreatedAt,
  DateTime  UpdatedAt
);