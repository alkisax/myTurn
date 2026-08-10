// backend\auth\Dtos\UpdateUserDto.csnamespace backend_csharp.Dtos;

// DTO για update → όλα optional 
public record UpdateUserDto(
  string? Username,
  string? Name,
  string? Email,
  string? Password,
  string? Role
);