// backend\Dtos\ServiceDtos\CreateServiceDto.cs
using System.ComponentModel.DataAnnotations;
namespace backend.Dtos.ServiceDtos;
public record CreateServiceDto(
  [Required]
  int LocationId,
  [Required]
  [StringLength(100)]
  string Name,
  string? Description,
  bool IsGeneric = false,
  [Range(1, int.MaxValue)]
  int? EstimatedServiceMinutes = null
);