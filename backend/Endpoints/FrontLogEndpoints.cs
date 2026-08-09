// backend\Endpoints\FrontLogEndpoints.cs

using backend_csharp.Controllers;
using backend_csharp.Dtos;

namespace backend_csharp.Endpoints;

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