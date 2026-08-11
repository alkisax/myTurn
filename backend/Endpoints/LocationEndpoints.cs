// backend\Endpoints\LocationEndpoints.cs

using backend.Controllers;
using backend.Dtos.LocationDtos;

namespace backend.Endpoints;

public static class LocationEndpoints
{
  public static void MapLocationEndpoints(this WebApplication app)
  {
    var group = app.MapGroup("/locations");

    // GET /locations
    // SUPERADMIN → βλέπει όλα τα locations
    group.MapGet("/", async (LocationController controller) =>
    {
      return await controller.GetAll();
    })
    .RequireAuthorization("SuperAdminOnly");

    // GET /locations/mine
    // ADMIN → βλέπει μόνο locations από companies στις οποίες έχει πρόσβαση
    group.MapGet("/mine", async (
      LocationController controller,
      HttpContext context
    ) =>
    {
      return await controller.GetMine(context.User);
    })
    .RequireAuthorization("AdminOnly");

    // GET /locations/:id
    group.MapGet("/{id:int}", async (
      int id,
      LocationController controller,
      HttpContext context
    ) =>
    {
      return await controller.GetById(id, context.User);
    })
    .RequireAuthorization("AdminOnly");

    // GET /locations/company/:companyId
    group.MapGet("/company/{companyId:int}", async (
      int companyId,
      LocationController controller,
      HttpContext context
    ) =>
    {
      return await controller.GetByCompanyId(
        companyId,
        context.User
      );
    })
    .RequireAuthorization("AdminOnly");

    // POST /locations
    group.MapPost("/", async (
      CreateLocationDto dto,
      LocationController controller,
      HttpContext context
    ) =>
    {
      return await controller.Create(
        dto,
        context.User
      );
    })
    .RequireAuthorization("AdminOnly");

    // PUT /locations/:id
    group.MapPut("/{id:int}", async (
      int id,
      UpdateLocationDto dto,
      LocationController controller,
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

    // DELETE /locations/:id
    group.MapDelete("/{id:int}", async (
      int id,
      LocationController controller,
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