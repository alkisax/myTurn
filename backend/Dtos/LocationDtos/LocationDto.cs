// backend\Dtos\LocationDtos\LocationDto.cs

namespace backend.Dtos.LocationDtos;
// το main dto, τα έχει όλα
public record LocationDto(
  int Id,
  int CompanyId,
  string Name,
  string? Address,
  bool IsActive,
  DateTime CreatedAt,
  DateTime UpdatedAt
);