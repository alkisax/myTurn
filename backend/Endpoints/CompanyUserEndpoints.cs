// backend\Endpoints\CompanyUserEndpoints.cs

using backend.Controllers;
using backend.Dtos.CompanyUserDtos;

namespace backend.Endpoints;

public static class CompanyUserEndpoints
{
  public static void MapCompanyUserEndpoints(this WebApplication app)
  {
    var group = app.MapGroup("/company-users");

    // GET /company-users
    group.MapGet("/", async (CompanyUserController controller) =>
    {
      return await controller.GetAll();
    })
    .RequireAuthorization("SuperAdminOnly");

    // GET /company-users/user/:userId
    group.MapGet("/user/{userId:int}", async (
      int userId,
      CompanyUserController controller
    ) =>
    {
      return await controller.GetByUserId(userId);
    })
    .RequireAuthorization("SuperAdminOnly");

    // GET /company-users/company/:companyId
    group.MapGet("/company/{companyId:int}", async (
      int companyId,
      CompanyUserController controller
    ) =>
    {
      return await controller.GetByCompanyId(companyId);
    })
    .RequireAuthorization("SuperAdminOnly");

    // POST /company-users
    group.MapPost("/", (
      CreateCompanyDto dto,
      CompanyController controller,
      HttpContext context
    ) =>
    {
      return controller.Create(dto, context.User);
    })
    .RequireAuthorization("AdminOnly");

    // DELETE /company-users/:id
    group.MapDelete("/{id:int}", async (
      int id,
      CompanyUserController controller
    ) =>
    {
      return await controller.Delete(id);
    })
    .RequireAuthorization("SuperAdminOnly");
  }
}