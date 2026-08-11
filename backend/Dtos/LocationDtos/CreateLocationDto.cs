// backend\Dtos\LocationDtos\CreateLocationDto.cs

using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.LocationDtos;

// χωρίς id-isActive-created/updated
public record CreateLocationDto(
  [Required]
  int CompanyId,

  [Required]
  [StringLength(100)]
  string Name,

  string? Address
);