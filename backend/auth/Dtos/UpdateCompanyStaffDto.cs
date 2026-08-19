using System.ComponentModel.DataAnnotations;

namespace backend.auth.Dtos;

public record UpdateCompanyStaffDto(
  [Required]
  string Username,

  string? Name,

  [EmailAddress]
  string? Email,

  string? Password
);
