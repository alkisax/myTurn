// backend\auth\Dtos\UpdateUserDto.cs
namespace backend.auth.Dtos;

// DTO για update → όλα optional 
// έχει όλα τα πεδία εκτός απο role γιατι πρέπει η αλλαγή του να είναι self or admin protected και γίνετε με άλλο endpoint update role
// το updated at το κάνει ο controller
public record UpdateUserDto(
  string? Username,
  string? Name,
  string? Email,
  string? Password
);