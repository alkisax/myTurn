// backend\Dtos\LocationDtos\UpdateLocationDto.cs

namespace backend.Dtos.LocationDtos;

// χωρίς id, companyId, created/updated
// το isActive χρειάζεται για toggle
public record UpdateLocationDto(
  string? Name,
  string? Address,
  bool? IsActive
);