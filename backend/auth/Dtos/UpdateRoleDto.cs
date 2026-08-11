// backend\auth\Dtos\UpdateRoleDto.cs
namespace backend.auth.Dtos;

// η αλλαγή του να είναι self or admin protected
public record class UpdateRoleDto
(
  string Role
);