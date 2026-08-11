// backend\Endpoints\ServiceEndpoints.cs
using backend.Controllers;
using backend.Dtos.ServiceDtos;
namespace backend.Endpoints;
public static class ServiceEndpoints
{
  public static void MapServiceEndpoints(this WebApplication app)
  {
    var group = app.MapGroup("/services");
    group.MapGet("/", async (
      ServiceController controller
    ) =>
    {
      return await controller.GetAll();
    })
    .RequireAuthorization("SuperAdminOnly");
    group.MapGet("/{id:int}", async (
      int id,
      ServiceController controller,
      HttpContext context
    ) =>
    {
      return await controller.GetById(
        id,
        context.User
      );
    })
    .RequireAuthorization("AdminOnly");
    group.MapGet("/location/{locationId:int}", async (
      int locationId,
      ServiceController controller,
      HttpContext context
    ) =>
    {
      return await controller.GetByLocationId(
        locationId,
        context.User
      );
    })
    .RequireAuthorization("AdminOnly");
    group.MapGet("/company/{companyId:int}", async (
      int companyId,
      ServiceController controller,
      HttpContext context
    ) =>
    {
      return await controller.GetByCompanyId(
        companyId,
        context.User
      );
    })
    .RequireAuthorization("AdminOnly");
    group.MapPost("/", async (
      CreateServiceDto dto,
      ServiceController controller,
      HttpContext context
    ) =>
    {
      return await controller.Create(
        dto,
        context.User
      );
    })
    .RequireAuthorization("AdminOnly");
    group.MapPut("/{id:int}", async (
      int id,
      UpdateServiceDto dto,
      ServiceController controller,
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
    group.MapDelete("/{id:int}", async (
      int id,
      ServiceController controller,
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