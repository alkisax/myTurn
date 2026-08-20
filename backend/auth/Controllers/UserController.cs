// backend\auth\Controllers\UserController.cs
using backend.auth.Daos;
using backend.auth.Dtos;
using System.Security.Claims;

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
  //
  // ⚠️ Πλέον το generic role change είναι SUPERADMIN protected.
  // Ο ADMIN δημιουργεί STAFF από το ειδικό Company endpoint
  // και δεν χρειάζεται να αλλάζει αυθαίρετα roles άλλων users.
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
  public async Task<IResult> Delete(
    int id,
    DeleteOwnAdminDto? data,
    ClaimsPrincipal currentUser
  )
  {
    var role = currentUser.FindFirst(ClaimTypes.Role)?.Value;

    if (role == "ADMIN")
    {
      var authenticatedUserId = currentUser.FindFirst("id")?.Value;

      if (!int.TryParse(authenticatedUserId, out var currentUserId) || currentUserId != id)
      {
        return Results.Forbid();
      }

      if (string.IsNullOrWhiteSpace(data?.CurrentPassword))
      {
        return Results.BadRequest(new
        {
          status = false,
          message = "Current password is required"
        });
      }

      var user = await _dao.GetById(id);

      if (user is null)
      {
        return Results.NotFound(new
        {
          status = false,
          message = "User not found"
        });
      }

      if (!BCrypt.Net.BCrypt.Verify(data.CurrentPassword, user.HashedPassword))
      {
        return Results.Json(new
        {
          status = false,
          message = "Invalid current password"
        }, statusCode: StatusCodes.Status401Unauthorized);
      }

      var deletedAdmin = await _dao.DeleteAdminSelf(id);

      if (!deletedAdmin)
      {
        return Results.Conflict(new
        {
          status = false,
          message = "Cannot delete companies shared with another ADMIN"
        });
      }

      return Results.Ok(new
      {
        status = true,
        message = $"User {user.Username} deleted"
      });
    }

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

  // ⚠️ super admin
  public async Task<IResult> MakeSuperAdmin(int id)
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

    user.Role = "SUPERADMIN";

    var updated = await _dao.Update(id, user);

    return Results.Ok(new
    {
      status = true,
      data = new
      {
        updated!.Id,
        updated.Username,
        updated.Role
      }
    });
  }
}
