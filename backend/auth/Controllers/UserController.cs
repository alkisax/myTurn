// backend\auth\Controllers\UserController.cs
using backend_csharp.Dao;
using backend_csharp.Dtos;
using backend_csharp.Models;

namespace backend_csharp.Controllers;

public class UserController
{
  private readonly UserDao _dao;

  public UserController(UserDao dao)
  {
    _dao = dao;
  }

  // GET ALL
  public async Task<IResult> GetAll()
  {
    var users = await _dao.GetAll();

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

    var hashed = BCrypt.Net.BCrypt.HashPassword(newUser.Password);

    var user = new User
    {
      Username = newUser.Username,
      Name = newUser.Name,
      Email = newUser.Email,
      Role = newUser.Role ?? "USER",
      HashedPassword = hashed
    };

    var created = await _dao.Create(user);

    var dto = new UserSummaryDto(
      created.Id,
      created.Username,
      created.Name,
      created.Email,
      created.Role,
      created.CreatedAt,
      created.UpdatedAt
    );

    return Results.Created($"/users/{created.Id}", new
    {
      status = true,
      data = dto
    });
  }

  // UPDATE
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

    var data= new
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