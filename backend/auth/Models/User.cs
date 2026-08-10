// backend\auth\Models\User.cs
namespace backend_csharp.Models;

public class User
{
  public int Id { get; set; }
  public required string Username { get; set; }
  public string? Name { get; set; }
  public string? Email { get; set; }
  public string Role { get; set; } = "USER";
  public required string HashedPassword { get; set; }
  public string? CreatedAt { get; set; }
  public string? UpdatedAt { get; set; }
}
