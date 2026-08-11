// backend/Endpoints/CompanyEndpoints.cs

using backend;

namespace backend.Endpoints;

public static class CompanyEndpoints
{
  public static void MapCompanyEndpoints(this WebApplication app)
  {
    var group = app.MapGroup("/companies");

    group.MapGet("/", (CompanyController controller) =>
      controller.GetAll());

    group.MapGet("/{id:int}", (int id, CompanyController controller) =>
      controller.GetById(id));

    group.MapPost("/", (CreateCompanyDto dto, CompanyController controller) =>
      controller.Create(dto));

    group.MapPut("/{id:int}", (int id, CreateCompanyDto dto, CompanyController controller) =>
      controller.Update(id, dto));

    group.MapDelete("/{id:int}", (int id, CompanyController controller) =>
      controller.Delete(id));
  }
}