// backend\Data\DataExtensions.cs

using Microsoft.EntityFrameworkCore;

namespace backend;

public static class DataExtensions
{

  public static void MigrateDb(this WebApplication app)
  {
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<MyTurnContext>();
    dbContext.Database.Migrate();
  }
}
