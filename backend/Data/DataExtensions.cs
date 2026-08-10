// backend\Data\DataExtensions.cs

using backend_csharp.data;
using Microsoft.EntityFrameworkCore;

namespace backend;

public static class DataExtensions
{

  public static void MigrateDb(this WebApplication app)
  {
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<MyTurnContext>();
    dbContext.Database.Migrate();

    var userDb = scope.ServiceProvider.GetRequiredService<UserContext>();
    userDb.Database.Migrate();
  }
}
