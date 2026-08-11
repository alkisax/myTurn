// backend\auth\Dtos\CreateUserDto.cs
using System.ComponentModel.DataAnnotations;

namespace backend.auth.Dtos;

// δεν έχει id, role (είναι αυτόματα user), created at (φτιάχνετε αυτόματα)
// αλλα έχει plain text password γιατί είναι αυτό που μας στέλνει ο user. δεν θα αποθηκευτεί έτσι ομως. Εδω αυτό είναι μόνο για την μεταφορα κατα την δημιουργία
public record class CreateUserDto(
  [Required]
  string Username,

  string? Name,

  [EmailAddress]
  string? Email,

  [Required]
  [MinLength(6)]
  string Password
);
