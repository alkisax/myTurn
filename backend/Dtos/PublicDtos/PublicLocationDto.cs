namespace backend.Dtos.PublicDtos;

public record PublicLocationDto(
  int Id,
  string Name,
  string Slug,
  string? Address,
  string? Country,
  bool IsActive
);
