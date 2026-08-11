// backend\auth\Endpoints\UserEndpoint.cs
using backend.auth.Controllers;
using backend.auth.Dtos;

namespace backend.auth.Endpoints;

public static class UserEndpoint
{
  public static void MapUsersEndpoints(this WebApplication app)
  {
    var group = app.MapGroup("/users");

    // GET /users → καλεί controller
    group.MapGet("/", async (UserController controller) =>
    {
      return await controller.GetAll();
    })
    .RequireAuthorization("AdminOnly");

    // GET /users/:id
    group.MapGet("/{id}", async (int id, UserController controller) =>
    {
      return await controller.GetById(id);
    })
    .RequireAuthorization("SelfOrAdmin");

    // POST /users
    group.MapPost("/", async (CreateUserDto newUser, UserController controller) =>
    {
      return await controller.Create(newUser);
    })
    .RequireAuthorization("AdminOnly");

    // PUT /users/:id
    // SELF OR ADMIN
    group.MapPut("/{id}", async (int id, UpdateUserDto data, UserController controller) =>
    {
      return await controller.Update(id, data);
    })
    .RequireAuthorization("SelfOrAdmin");


    // ADMIN ONLY
    group.MapPut("/{id}/role", async (int id, UpdateRoleDto dto, UserController controller) =>
    {
      return await controller.UpdateRole(id, dto);
    })
    .RequireAuthorization("AdminOnly");

    // DELETE /users/:id
    group.MapDelete("/{id}", async (int id, UserController controller) =>
    {
      return await controller.Delete(id);
    })
    .RequireAuthorization("SelfOrAdmin");
  }
}