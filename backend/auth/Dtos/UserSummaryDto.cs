// backend\auth\Dtos\UserSummaryDto.cs
namespace backend_csharp.Dtos;

public record UserSummaryDto(
  int Id,
  string Username,
  string? Name,
  string? Email,
  string Role,
  string? CreatedAt,
  string? UpdatedAt
);