// backend\auth\Dtos\LoginUserDto.cs
using System.ComponentModel.DataAnnotations;
namespace backend.auth.Dtos;

// μόνο username password
public record class LoginUserDto
(
  [Required]
  [MinLength(3)]
  [MaxLength(50)]
  string Username,

  [Required]
  [MinLength(6)]
  [MaxLength(128)]
  string Password
);
