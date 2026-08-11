// backend\auth\Dtos\UpdateRoleDto.cs
namespace backend.auth.Dtos;

// η αλλαγή του να είναι superAdmin or admin protected
public record class UpdateRoleDto
(
  string Role
);