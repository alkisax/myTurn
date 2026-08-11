// backend\Endpoints\FrontLogEndpoints.cs

using backend.Controllers;
using backend.Dtos;

namespace backend.Endpoints;

public static class FrontLogEndpoints
{
  public static void MapFrontLogEndpoints(this WebApplication app)
  {
    var group = app.MapGroup("/front-logs");

    group.MapPost("/", (LogController controller, FrontLogDto dto) =>
    {
      return controller.ForwardFrontLogs(dto);
    });
  }
}