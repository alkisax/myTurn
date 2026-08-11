// backend\Endpoints\CompanyUserEndpoints.cs

using backend.Controllers;
using backend.Dtos.CompanyUserDtos;
using backend.auth.Dtos;

namespace backend.Endpoints;

public static class CompanyUserEndpoints
{
  public static void MapCompanyUserEndpoints(this WebApplication app)
  {
    var group = app.MapGroup("/company-users");

    // GET /company-users
    // Global view → μόνο SUPERADMIN
    group.MapGet("/", async (CompanyUserController controller) =>
    {
      return await controller.GetAll();
    })
    .RequireAuthorization("SuperAdminOnly");

    // GET /company-users/mine
    //
    // Ο logged-in user βλέπει τις Companies στις οποίες ανήκει.
    // Κυρίως για STAFF μετά το login.
    //
    // RequireAuthorization() → αρκεί να είναι authenticated.
    // Δεν μπορεί να δει data άλλου user γιατί το id έρχεται από το JWT.
    group.MapGet("/mine", async (
      CompanyUserController controller,
      HttpContext context
    ) =>
    {
      return await controller.GetMine(context.User);
    })
    .RequireAuthorization();

    // GET /company-users/user/:userId
    // Global lookup ενός οποιουδήποτε user → μόνο SUPERADMIN προς το παρόν
    group.MapGet("/user/{userId:int}", async (
      int userId,
      CompanyUserController controller
    ) =>
    {
      return await controller.GetByUserId(userId);
    })
    .RequireAuthorization("SuperAdminOnly");

    // GET /company-users/company/:companyId
    // ADMIN μπορεί να δει members μόνο company στην οποία έχει πρόσβαση.
    group.MapGet("/company/{companyId:int}", async (
      int companyId,
      CompanyUserController controller,
      HttpContext context
    ) =>
    {
      return await controller.GetByCompanyId(
        companyId,
        context.User
      );
    })
    .RequireAuthorization("AdminOnly");

    // GET /company-users/company/:companyId/staff
    //
    // Ο ADMIN βλέπει την πραγματική λίστα STAFF της Company
    // και όχι μόνο τα CompanyUser relation ids.
    group.MapGet("/company/{companyId:int}/staff", async (
      int companyId,
      CompanyUserController controller,
      HttpContext context
    ) =>
    {
      return await controller.GetStaffByCompanyId(
        companyId,
        context.User
      );
    })
    .RequireAuthorization("AdminOnly");

    // POST /company-users
    // Generic δημιουργία relation.
    // Το κρατάμε SUPERADMIN only ώστε ένας απλός ADMIN
    // να μην μπορεί να συνδέσει αυθαίρετους users/roles με companies.
    group.MapPost("/", async (
      CreateCompanyUserDto dto,
      CompanyUserController controller
    ) =>
    {
      return await controller.Create(dto);
    })
    .RequireAuthorization("SuperAdminOnly");

    // POST /company-users/company/:companyId/staff
    //
    // Ο ADMIN δημιουργεί νέο STAFF account
    // και ο server το συνδέει αυτόματα με τη συγκεκριμένη Company.
    //
    // Δεν χρειάζεται πρώτα να δημιουργήσουμε USER και μετά
    // να του αλλάξουμε role.
    group.MapPost("/company/{companyId:int}/staff", async (
      int companyId,
      CreateUserDto dto,
      CompanyUserController controller,
      HttpContext context
    ) =>
    {
      return await controller.CreateStaff(
        companyId,
        dto,
        context.User
      );
    })
    .RequireAuthorization("AdminOnly");

    // DELETE /company-users/company/:companyId/staff/:userId
    // ADMIN αφαιρεί STAFF από μία από τις companies του.
    group.MapDelete("/company/{companyId:int}/staff/{userId:int}", async (
      int companyId,
      int userId,
      CompanyUserController controller,
      HttpContext context
    ) =>
    {
      return await controller.RemoveStaff(
        companyId,
        userId,
        context.User
      );
    })
    .RequireAuthorization("AdminOnly");

    // DELETE /company-users/:id
    // Generic διαγραφή relation → μόνο SUPERADMIN.
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