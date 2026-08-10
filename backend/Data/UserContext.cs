// backend-csharp\data\UserContext.cs
using backend_csharp.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_csharp.data;

public class UserContext(DbContextOptions<UserContext> options) : DbContext(options)
{
  public DbSet<User> Users => Set<User>();
}
