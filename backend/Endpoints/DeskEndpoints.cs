// backend\Endpoints\DeskEndpoints.cs
using backend.Controllers;
using backend.Dtos.DeskDtos;

namespace backend.Endpoints;

public static class DeskEndpoints
{
  public static void MapDeskEndpoints(this WebApplication app)
  {
    var group = app.MapGroup("/desks");


    // SUPERADMIN → όλα τα desks της πλατφόρμας
    group.MapGet("/", async (
      DeskController controller
    ) =>
    {
      return await controller.GetAll();
    })
    .RequireAuthorization("SuperAdminOnly");


    // ADMIN → συγκεκριμένο Desk μόνο δικής του Company
    group.MapGet("/{id:int}", async (
      int id,
      DeskController controller,
      HttpContext context
    ) =>
    {
      return await controller.GetById(
        id,
        context.User
      );
    })
    .RequireAuthorization("AdminOnly");


    // ✅ ADMIN βλέπει όλα τα desks συγκεκριμένου Location
    group.MapGet("/location/{locationId:int}", async (
      int locationId,
      DeskController controller,
      HttpContext context
    ) =>
    {
      return await controller.GetByLocationId(
        locationId,
        context.User
      );
    })
    .RequireAuthorization("AdminOnly");


    // ADMIN βλέπει όλα τα desks μιας Company
    group.MapGet("/company/{companyId:int}", async (
      int companyId,
      DeskController controller,
      HttpContext context
    ) =>
    {
      return await controller.GetByCompanyId(
        companyId,
        context.User
      );
    })
    .RequireAuthorization("AdminOnly");


    // ✅ ADMIN δημιουργεί Desk
    group.MapPost("/", async (
      CreateDeskDto dto,
      DeskController controller,
      HttpContext context
    ) =>
    {
      return await controller.Create(
        dto,
        context.User
      );
    })
    .RequireAuthorization("AdminOnly");


    // ADMIN αλλάζει Name / IsActive / Queue
    group.MapPut("/{id:int}", async (
      int id,
      UpdateDeskDto dto,
      DeskController controller,
      HttpContext context
    ) =>
    {
      return await controller.Update(
        id,
        dto,
        context.User
      );
    })
    .RequireAuthorization("AdminOnly");


    // ADMIN διαγράφει Desk δικής του Company
    group.MapDelete("/{id:int}", async (
      int id,
      DeskController controller,
      HttpContext context
    ) =>
    {
      return await controller.Delete(
        id,
        context.User
      );
    })
    .RequireAuthorization("AdminOnly");
  }
}