// backend/Endpoints/CompanyEndpoints.cs

using backend;

namespace backend.Endpoints;

public static class CompanyEndpoints
{
  public static void MapCompanyEndpoints(this WebApplication app)
  {
    var group = app.MapGroup("/companies");

    // SUPERADMIN → όλες οι companies
    group.MapGet("/", (CompanyController controller) =>
      controller.GetAll())
    .RequireAuthorization("SuperAdminOnly");

    // ADMIN → μόνο οι δικές του companies
    group.MapGet("/mine", (
      CompanyController controller,
      HttpContext context
    ) =>
      controller.GetMine(context.User))
    .RequireAuthorization("AdminOnly");

    // ADMIN/SUPERADMIN → μόνο αν έχει πρόσβαση στη συγκεκριμένη company
    group.MapGet("/{id:int}", (
      int id,
      CompanyController controller,
      HttpContext context
    ) =>
      controller.GetById(id, context.User))
    .RequireAuthorization("AdminOnly");

    // ADMIN/SUPERADMIN → δημιουργεί company και συνδέεται αυτόματα μέσω CompanyUser
    group.MapPost("/", (
      CreateCompanyDto dto,
      CompanyController controller,
      HttpContext context
    ) =>
      controller.Create(dto, context.User))
    .RequireAuthorization("AdminOnly");

    // ADMIN/SUPERADMIN → μόνο αν έχει πρόσβαση στη συγκεκριμένη company
    group.MapPut("/{id:int}", (
      int id,
      CreateCompanyDto dto,
      CompanyController controller,
      HttpContext context
    ) =>
      controller.Update(id, dto, context.User))
    .RequireAuthorization("AdminOnly");

    // ADMIN/SUPERADMIN → μόνο αν έχει πρόσβαση στη συγκεκριμένη company
    group.MapDelete("/{id:int}", (
      int id,
      CompanyController controller,
      HttpContext context
    ) =>
      controller.Delete(id, context.User))
    .RequireAuthorization("AdminOnly");
  }
}