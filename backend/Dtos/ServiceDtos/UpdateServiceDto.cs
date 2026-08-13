// backend\Dtos\ServiceDtos\UpdateServiceDto.cs
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.ServiceDtos;

public record UpdateServiceDto(
  string? Name,
  string? Description,
  bool? IsActive,
  bool? IsGeneric,
  [Range(1, int.MaxValue)]
  int? EstimatedServiceMinutes
);