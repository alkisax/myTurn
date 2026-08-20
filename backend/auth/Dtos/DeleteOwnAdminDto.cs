using System.ComponentModel.DataAnnotations;

namespace backend.auth.Dtos;

public record DeleteOwnAdminDto(
  [Required]
  string CurrentPassword
);
