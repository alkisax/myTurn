// backend\Controllers\FrontLogController.cs

using backend_csharp.Dtos;

namespace backend_csharp.Controllers;

public class LogController
{
  public IResult ForwardFrontLogs(FrontLogDto dto)
  {
    Console.WriteLine($"FRONT LOG: {dto.FrontLog}");
    return Results.Ok();
  }
}
