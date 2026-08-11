// backend\Endpoints\StaffSessionEndpoints.cs
using backend.Controllers;
using backend.Dtos.StaffSessionDtos;

namespace backend.Endpoints;

public static class StaffSessionEndpoints
{
  public static void MapStaffSessionEndpoints(
    this WebApplication app
  )
  {
    var group = app.MapGroup("/staff-sessions");


    // SUPERADMIN → όλα τα sessions
    group.MapGet("/", async (
      StaffSessionController controller
    ) =>
    {
      return await controller.GetAll();
    })
    .RequireAuthorization("SuperAdminOnly");


    // STAFF → δικό του ενεργό session
    group.MapGet("/mine", async (
      StaffSessionController controller,
      HttpContext context
    ) =>
    {
      return await controller.GetMine(context.User);
    })
    .RequireAuthorization();


    // STAFF μπαίνει σε Desk
    group.MapPost("/", async (
      CreateStaffSessionDto dto,
      StaffSessionController controller,
      HttpContext context
    ) =>
    {
      return await controller.Create(
        dto,
        context.User
      );
    })
    .RequireAuthorization();


    // STAFF κάνει ACTIVE / BREAK
    group.MapPut("/{id:int}/status", async (
      int id,
      UpdateStaffSessionStatusDto dto,
      StaffSessionController controller,
      HttpContext context
    ) =>
    {
      return await controller.UpdateStatus(
        id,
        dto,
        context.User
      );
    })
    .RequireAuthorization();


    // STAFF φεύγει από το Desk
    group.MapPost("/{id:int}/end", async (
      int id,
      StaffSessionController controller,
      HttpContext context
    ) =>
    {
      return await controller.End(
        id,
        context.User
      );
    })
    .RequireAuthorization();
  }
}