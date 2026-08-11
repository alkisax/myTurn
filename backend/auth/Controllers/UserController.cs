// backend\auth\Controllers\UserController.cs
using backend.auth.Daos;
using backend.auth.Dtos;
using backend.auth.Models;

namespace backend.auth.Controllers;

public class UserController
{
  // DI
  private readonly UserDao _dao;

  public UserController(UserDao dao)
  {
    _dao = dao;
  }

  // GET ALL
  public async Task<IResult> GetAll()
  {
    var users = await _dao.GetAll();

    // UserSummaryDto → δεν στέλνει καθόλου password (ούτε Plain Ούτε hashed)
    var data = users.Select(user => new UserSummaryDto(
      user.Id,
      user.Username,
      user.Name,
      user.Email,
      user.Role,
      user.CreatedAt,
      user.UpdatedAt
    ));

    return Results.Ok(new
    {
      status = true,
      data
    });
  }

  // GET BY ID
  public async Task<IResult> GetById(int id)
  {
    var user = await _dao.GetById(id);

    if (user is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "User not found"
      });
    }

    var dto = new UserSummaryDto(
      user.Id,
      user.Username,
      user.Name,
      user.Email,
      user.Role,
      user.CreatedAt,
      user.UpdatedAt
    );

    return Results.Ok(new
    {
      status = true,
      data = dto
    });
  }

  // CREATE (με check όπως node)
  // CreateUserDto → δεν έχει id, role (είναι αυτόματα user), created at (φτιάχνετε αυτόματα) αλλα έχει plain text password γιατί είναι αυτό που μας στέλνει ο user. δεν θα αποθηκευτεί έτσι ομως. Εδω αυτό είναι μόνο για την μεταφορα κατα την δημιουργία
  public async Task<IResult> Create(CreateUserDto newUser)
  {
    // check username exists
    var existing = await _dao.GetByUsername(newUser.Username);

    if (existing is not null)
    {
      return Results.Conflict(new
      {
        status = false,
        message = "Username already taken"
      });
    }

    // ⚠️ δεν αποθηκεύουμε plain text password
    var hashed = BCrypt.Net.BCrypt.HashPassword(newUser.Password);

    var user = new User
    {
      Username = newUser.Username,
      Name = newUser.Name,
      Email = newUser.Email,
      Role = "USER", // εδω μπαίνει το role που δεν έρχεται απο το dto. Πάντα πρώτα User και η αλλαγή είναι αναβάθμιση που κάνει ο admin με την  TODO
      HashedPassword = hashed
    };

    var created = await _dao.Create(user);

    // UserSummaryDto για την επιστροφή
    var dto = new UserSummaryDto(
      created.Id,
      created.Username,
      created.Name,
      created.Email,
      created.Role,
      created.CreatedAt,
      created.UpdatedAt
    );

    // οχι Results.Ok
    // Ο user δημιουργήθηκε επιτυχώς, γύρνα HTTP 201 Created. Το: $"/users/{created.Id}" βάζει στο response header το πού βρίσκεται ο νέος resource.
    return Results.Created($"/users/{created.Id}", new
    {
      status = true,
      data = dto
    });
  }

  // UPDATE
  // UpdateUserDto → έχει όλα τα πεδία εκτός απο role γιατι πρέπει η αλλαγή του να είναι self or admin protected και γίνετε με άλλο endpoint update role. Tο updated at το κάνει ο controller 
  public async Task<IResult> Update(int id, UpdateUserDto data)
  {
    var user = await _dao.GetById(id);

    if (user is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "User not found"
      });
    }

    // μπορώ με το update να φτιάξω νέο password αρα χρειαζομαι να το κάνω Hashed
    if (data.Password is not null)
    {
      user.HashedPassword = BCrypt.Net.BCrypt.HashPassword(data.Password);
    }

    user.Username = data.Username ?? user.Username;
    user.Name = data.Name ?? user.Name;
    user.Email = data.Email ?? user.Email;

    var updated = await _dao.Update(id, user);

    if (updated is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "User not found"
      });
    }

    var dto = new UserSummaryDto(
      updated.Id,
      updated.Username,
      updated.Name,
      updated.Email,
      updated.Role,
      updated.CreatedAt,
      updated.UpdatedAt
    );

    return Results.Ok(new
    {
      status = true,
      data = dto
    });
  }

  // UpdateRoleDto → η αλλαγή του να είναι self or admin protected
  public async Task<IResult> UpdateRole(int id, UpdateRoleDto dto)
  {
    var user = await _dao.GetById(id);

    if (user is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "user not found"
      });
    }

    // validate roles χωρίς enum
    var validRoles = new[] { "ADMIN", "STAFF", "USER" };

    if (!validRoles.Contains(dto.Role))
    {
      return Results.BadRequest(new
      {
        status = false,
        message = "Invalid role"
      });
    }

    user.Role = dto.Role;

    var updated = await _dao.Update(id, user);

    var data = new
    {
      updated!.Id,
      updated.Username,
      updated.Role
    };

    return Results.Ok(new
    {
      status = true,
      data = data
    });
  }

  // DELETE
  public async Task<IResult> Delete(int id)
  {
    var deleted = await _dao.Delete(id);

    if (deleted is null)
    {
      return Results.NotFound(new
      {
        status = false,
        message = "User not found"
      });
    }

    return Results.Ok(new
    {
      status = true,
      message = $"User {deleted.Username} deleted"
    });
  }
}