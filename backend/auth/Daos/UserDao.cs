// backend\auth\Daos\UserDao.cs
using backend_csharp.data;
using backend_csharp.Models;
using Microsoft.EntityFrameworkCore;

namespace backend_csharp.Dao;

public class UserDao
{
  // φτιάχνω μια μεταβλητή που μέσα της θα βάλω την λειτουργικότητα της db. Στο ονομα βάζω _ γιατι ...
  private readonly UserContext _db;

  public UserDao(UserContext db)
  {
    _db = db;
  }

  // mapper DB → app (εδώ απλά επιστρέφουμε το entity)
  private static User Map(User user) => user;

  // GET ALL
  public async Task<List<User>> GetAll()
  {
    var users = await _db.Users
      .AsNoTracking()
      .ToListAsync();

    return users.Select(Map).ToList();
  }

  // GET BY ID
  public async Task<User?> GetById(int id)
  {
    var user = await _db.Users.FindAsync(id);
    return user is null ? null : Map(user);
  }

  // GET BY USERNAME
  public async Task<User?> GetByUsername(string username)
  {
    var user = await _db.Users
      .FirstOrDefaultAsync(u => u.Username == username);

    return user is null ? null : Map(user);
  }

  // GET BY EMAIL
  public async Task<User?> GetByEmail(string email)
  {
    var user = await _db.Users
      .FirstOrDefaultAsync(user => user.Email == email);

    return user is null ? null : Map(user);
  }

  // CREATE
  public async Task<User> Create(User user)
  {
    _db.Users.Add(user);
    await _db.SaveChangesAsync();
    return user;
  }

  // UPDATE
  public async Task<User?> Update(int id, User updatedData)
  {
    var user = await _db.Users.FindAsync(id);
    if (user is null) return null;

    user.Username = updatedData.Username ?? user.Username;
    user.Name = updatedData.Name ?? user.Name;
    user.Email = updatedData.Email ?? user.Email;
    user.Role = updatedData.Role ?? user.Role;
    user.HashedPassword = updatedData.HashedPassword ?? user.HashedPassword;

    await _db.SaveChangesAsync();
    return user;
  }

  // DELETE
  public async Task<User?> Delete(int id)
  {
    var user = await _db.Users.FindAsync(id);
    if (user is null) return null;

    _db.Users.Remove(user);
    await _db.SaveChangesAsync();

    return user;
  }
}