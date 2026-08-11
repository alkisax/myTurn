// backend\Endpoints\LocationEndpoints.cs
//⚠️⚠️⚠️⚠️ αργότερα θα προσθέσουμε και έλεγχο ότι ο ADMIN έχει πρόσβαση στη συγκεκριμένη Company, όχι απλώς ότι έχει role ADMIN.
using backend.Controllers;
using backend.Dtos.LocationDtos;

namespace backend.Endpoints;

public static class LocationEndpoints
{
  public static void MapLocationEndpoints(this WebApplication app)
  {
    var group = app.MapGroup("/locations");

    // GET /locations
    group.MapGet("/", async (LocationController controller) =>
    {
      return await controller.GetAll();
    })
    .RequireAuthorization("AdminOnly");

    // GET /locations/:id
    group.MapGet("/{id:int}", async (int id, LocationController controller) =>
    {
      return await controller.GetById(id);
    })
    .RequireAuthorization("AdminOnly");

    // GET /locations/company/:companyId
    group.MapGet("/company/{companyId:int}", async (
      int companyId,
      LocationController controller
    ) =>
    {
      return await controller.GetByCompanyId(companyId);
    })
    .RequireAuthorization("AdminOnly");

    // POST /locations
    group.MapPost("/", async (
      CreateLocationDto dto,
      LocationController controller
    ) =>
    {
      return await controller.Create(dto);
    })
    .RequireAuthorization("AdminOnly");

    // PUT /locations/:id
    group.MapPut("/{id:int}", async (
      int id,
      UpdateLocationDto dto,
      LocationController controller
    ) =>
    {
      return await controller.Update(id, dto);
    })
    .RequireAuthorization("AdminOnly");

    // DELETE /locations/:id
    group.MapDelete("/{id:int}", async (
      int id,
      LocationController controller
    ) =>
    {
      return await controller.Delete(id);
    })
    .RequireAuthorization("AdminOnly");
  }
}