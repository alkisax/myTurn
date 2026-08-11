// backend\Dtos\ServiceDtos\UpdateServiceDto.cs
namespace backend.Dtos.ServiceDtos;
public record UpdateServiceDto(
  string? Name,
  string? Description,
  bool? IsActive,
  bool? IsGeneric
);