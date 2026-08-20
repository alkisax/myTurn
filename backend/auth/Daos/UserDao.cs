// backend\auth\Daos\UserDao.cs

using backend.auth.Models;
using backend.Services;
using Microsoft.EntityFrameworkCore;

namespace backend.auth.Daos;

public class UserDao
{
  // φτιάχνω μια μεταβλητή που μέσα της θα βάλω την λειτουργικότητα της db. Στο ονομα βάζω _ γιατι είναι convention για τα private fields.
  private readonly MyTurnContext _db;
  private readonly TenantDeletionService _tenantDeletionService;

  // DI καλό την ίδια την UserDao μεσα στην οποία είμαστε ήδη μεσα. Η UserDao χρειάζεται για να δουλέψει ένα db, δεν το φτιάχνει με new αλλα βλέπει οτι υπάρχει στο περιβάλλον του προγραμματος (είναι δηλωμένο στην program με builder.Services.AddSqlite<MyTurnContext>(connString);)
  public UserDao(
    MyTurnContext db,
    TenantDeletionService tenantDeletionService
  )
  {
    _db = db;
    _tenantDeletionService = tenantDeletionService;
  }

  // εδω χρησιμοποιώ παντου type User γιατί αυτο το αρχείο μιλάει με την βάση απευθείας. τον ελεγχο με τα Dto τον κάνω στον controller

  // mapper DB → app (εδώ απλά επιστρέφουμε το entity)
  private static User Map(User user) => user;

  // GET ALL → .ToListAsync();
  public async Task<List<User>> GetAll()
  {
    var users = await _db.Users
      .AsNoTracking() //Φέρε μου τα δεδομένα μόνο για να τα διαβάσω. Μην τα παρακολουθείς για αλλαγές - μια φωτοτυπία της λίστας. Δεν σκοπεύω να την επεξεργαστώ..
      .ToListAsync();

    // Πάρε όλους τους users, πέρασε τον καθένα από τη Map, και ξανακανε τους λίστα. Αλλά επειδή η Map κάνει μόνο: User Map(User user) => user; αυτή η γραμμή είναι ουσιαστικά άχρηστη. Θα μπορούσα απλά: return users;
    return users.Select(Map).ToList();
  }

  // GET BY ID → .FindAsync(id)
  public async Task<User?> GetById(int id)
  {
    var user = await _db.Users.FindAsync(id);
    return user is null ? null : Map(user);
  }

  // GET BY USERNAME → .FirstOrDefaultAsync
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

  // Επιστρέφει τους πραγματικούς User records των STAFF
  // που είναι συνδεδεμένοι με συγκεκριμένη Company μέσω CompanyUser.
  public async Task<List<User>> GetStaffByCompanyId(int companyId)
  {
    return await _db.Users
      .AsNoTracking()
      .Where(user =>
        user.Role == "STAFF" &&
        _db.CompanyUsers.Any(companyUser =>
          companyUser.UserId == user.Id &&
          companyUser.CompanyId == companyId
        )
      )
      .ToListAsync();
  }

  // CREATE → .Add
  public async Task<User> Create(User user)
  {
    _db.Users.Add(user);
    await _db.SaveChangesAsync();
    return user;
  }

  // UPDATE
  public async Task<User?> Update(int id, User updatedData)
  {
    // πρώτα ψάχνουμε να δούμε αν υπάρχει
    var user = await _db.Users.FindAsync(id);
    if (user is null) return null;

    user.Username = updatedData.Username;
    user.Name = updatedData.Name;
    user.Email = updatedData.Email;
    user.Role = updatedData.Role;
    user.HashedPassword = updatedData.HashedPassword;
    user.UpdatedAt = DateTime.UtcNow;

    await _db.SaveChangesAsync();
    return user;
  }

  // DELETE → .Remove
  public async Task<User?> Delete(int id)
  {
    var user = await _db.Users.FindAsync(id);
    if (user is null) return null;

    _db.Users.Remove(user);
    await _db.SaveChangesAsync();

    return user;
  }

  public async Task<bool> DeleteAdminSelf(int id)
  {
    return await _tenantDeletionService.DeleteAdminAsync(id) ==
      AdminTenantDeletionResult.Deleted;
  }
}
