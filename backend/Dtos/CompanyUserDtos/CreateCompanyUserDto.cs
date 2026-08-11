// backend\Dtos\CompanyUserDtos\CreateCompanyUserDto.cs

using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.CompanyUserDtos;

public record CreateCompanyUserDto(
  [Required]
  int UserId,

  [Required]
  int CompanyId
);