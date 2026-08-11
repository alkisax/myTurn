// backend\Dtos\ServiceDtos\ServiceDto.cs
namespace backend.Dtos.ServiceDtos;
public record ServiceDto(
  int Id,
  int CompanyId,
  int LocationId,
  string Name,
  string? Description,
  bool IsActive,
  bool IsGeneric,
  DateTime CreatedAt,
  DateTime UpdatedAt
);