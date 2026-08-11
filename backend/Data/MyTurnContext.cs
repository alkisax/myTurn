// backend\Data\MyTurnContext.cs

using Backend;
using backend.auth.Models;
// Το Entity Framework Core είναι ο “μεταφραστής” ανάμεσα στην C# και τη βάση δεδομένων. Εσύ γράφεις C#: _db.Users.ToListAsync(); και το Entity Framework το μεταφράζει σε SQL τύπου: SELECT * FROM Users;
using Microsoft.EntityFrameworkCore; //ORM - Object-Relational Mapper

namespace backend;

// εδω η db μου είναι σαν μια ντουλάπα με συρτάρια. αργότερα στο dao κάνω private readonly MyTurnContext _db; για να έχω πρόσβαση στην db
public class MyTurnContext(DbContextOptions<MyTurnContext> options) : DbContext(options)
{
  public DbSet<Company> Companies => Set<Company>();
  public DbSet<User> Users => Set<User>();
}
