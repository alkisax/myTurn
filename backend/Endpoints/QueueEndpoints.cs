// backend\Endpoints\QueueEndpoints.cs
using backend.Controllers;
using backend.Dtos.QueueDtos;

namespace backend.Endpoints;

public static class QueueEndpoints
{
  public static void MapQueueEndpoints(this WebApplication app)
  {
    var group = app.MapGroup("/queues");

    // GET /queues
    // SUPERADMIN → βλέπει όλα τα queues
    group.MapGet("/", async (QueueController controller) =>
    {
      return await controller.GetAll();
    })
    .RequireAuthorization("SuperAdminOnly");

    // GET /queues/:id
    // ADMIN/SUPERADMIN
    // Ο Controller ελέγχει αν ο ADMIN έχει πρόσβαση
    // στην Company στην οποία ανήκει το Queue.
    group.MapGet("/{id:int}", async (
      int id,
      QueueController controller,
      HttpContext context
    ) =>
    {
      return await controller.GetById(
        id,
        context.User
      );
    })
    .RequireAuthorization("AdminOnly");

    // GET /queues/location/:locationId
    // ✅ ADMIN βλέπει τα queues συγκεκριμένου Location
    // μόνο αν το Location ανήκει σε δική του Company.
    group.MapGet("/location/{locationId:int}", async (
      int locationId,
      QueueController controller,
      HttpContext context
    ) =>
    {
      return await controller.GetByLocationId(
        locationId,
        context.User
      );
    })
    .RequireAuthorization("AdminOnly");

    // GET /queues/company/:companyId
    // ADMIN βλέπει όλα τα queues μιας Company
    // μόνο αν έχει CompanyUser relation με αυτή.
    group.MapGet("/company/{companyId:int}", async (
      int companyId,
      QueueController controller,
      HttpContext context
    ) =>
    {
      return await controller.GetByCompanyId(
        companyId,
        context.User
      );
    })
    .RequireAuthorization("AdminOnly");

    // POST /queues
    // ✅ ADMIN δημιουργεί Queue.
    //
    // Το frontend στέλνει LocationId.
    // Ο Controller:
    // - βρίσκει το Location
    // - παίρνει το CompanyId από αυτό
    // - ελέγχει ότι ο ADMIN έχει πρόσβαση
    // - δημιουργεί το Queue.
    group.MapPost("/", async (
      CreateQueueDto dto,
      QueueController controller,
      HttpContext context
    ) =>
    {
      return await controller.Create(
        dto,
        context.User
      );
    })
    .RequireAuthorization("AdminOnly");

    // PUT /queues/:id
    // ADMIN αλλάζει Queue μόνο δικής του Company.
    group.MapPut("/{id:int}", async (
      int id,
      UpdateQueueDto dto,
      QueueController controller,
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

    // POST /queues/:queueId/reset
    group.MapPost("/{queueId:int}/reset", async (
      int queueId,
      QueueController controller,
      HttpContext context
    ) =>
    {
      return await controller.Reset(queueId, context.User);
    })
    .RequireAuthorization("AdminOnly");

    // DELETE /queues/:id
    // ADMIN διαγράφει Queue μόνο δικής του Company.
    group.MapDelete("/{id:int}", async (
      int id,
      QueueController controller,
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
