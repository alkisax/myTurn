// backend\auth\Endpoints\UserEndpoint.cs
using backend.auth.Controllers;
using backend.auth.Dtos;
using Microsoft.AspNetCore.Mvc;

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
    group.MapGet("/{id}", async (
      int id,
      UserController controller
    ) =>
    {
      return await controller.GetById(id);
    })
    .RequireAuthorization("SelfOrAdmin");

    // Δεν υπάρχει πλέον generic POST /users.
    //
    // Δημιουργία accounts γίνεται από:
    //
    // POST /auth/register-admin
    // POST /auth/register-user
    // POST /company-users/company/:companyId/staff

    // PUT /users/:id
    // SELF OR ADMIN
    group.MapPut("/{id}", async (
      int id,
      UpdateUserDto data,
      UserController controller
    ) =>
    {
      return await controller.Update(id, data);
    })
    .RequireAuthorization("SelfOrAdmin");

    // Generic αλλαγή role.
    // Μόνο SUPERADMIN ώστε ένας ADMIN να μην μπορεί
    // να αλλάζει αυθαίρετα roles άλλων χρηστών.
    group.MapPut("/{id}/role", async (
      int id,
      UpdateRoleDto dto,
      UserController controller
    ) =>
    {
      return await controller.UpdateRole(id, dto);
    })
    .RequireAuthorization("SuperAdminOnly");


    // μόνο SUPERADMIN
    group.MapPut("/{id}/superadmin", async (
      int id,
      UserController controller
    ) =>
    {
      return await controller.MakeSuperAdmin(id);
    })
    .RequireAuthorization("SuperAdminOnly");

    // DELETE /users/:id
    group.MapDelete("/{id}", async (
      int id,
      [FromBody] DeleteOwnAdminDto? data,
      HttpContext httpContext,
      UserController controller
    ) =>
    {
      return await controller.Delete(id, data, httpContext.User);
    })
    .RequireAuthorization("SelfOrAdmin");
  }
}
