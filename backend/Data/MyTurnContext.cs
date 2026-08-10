// backend\Data\MyTurnContext.cs

using Backend;
using Microsoft.EntityFrameworkCore;

namespace backend;

public class MyTurnContext(DbContextOptions<MyTurnContext> options) : DbContext(options)
{
  public DbSet<Company> Companies => Set<Company>();
}
