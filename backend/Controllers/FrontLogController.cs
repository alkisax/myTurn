// backend\Controllers\FrontLogController.cs

using backend.Dtos;

namespace backend.Controllers;

public class LogController
{
  public IResult ForwardFrontLogs(FrontLogDto dto)
  {
    Console.WriteLine($"FRONT LOG: {dto.FrontLog}");
    return Results.Ok();
  }
}
