// backend\Dtos\LocationDtos\LocationDto.cs

namespace backend.Dtos.LocationDtos;
// το main dto, τα έχει όλα
public record LocationDto(
  int Id,
  int CompanyId,
  string Name,
  string Slug,
  string? Address,
  string? Country,
  double? Latitude,
  double? Longitude,
  string? TimeZoneId,
  bool IsActive,
  DateTime CreatedAt,
  DateTime UpdatedAt
);
