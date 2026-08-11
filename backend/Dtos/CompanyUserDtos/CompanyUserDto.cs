// backend\Dtos\CompanyUserDtos\CompanyUserDto.cs

namespace backend.Dtos.CompanyUserDtos;

public record CompanyUserDto(
  int Id,
  int UserId,
  int CompanyId,
  DateTime CreatedAt
);