// backend/Endpoints/TicketPdfEndpoints.cs

using backend.Controllers;

namespace backend.Endpoints;

public static class TicketPdfEndpoints
{
  public static void MapTicketPdfEndpoints(
    this WebApplication app
  )
  {
    var group = app.MapGroup("/tickets");

    // GET /tickets/{trackingToken}/pdf
    // Public endpoint, όπως και το tracking endpoint.
    group.MapGet("/{trackingToken}/pdf", async (
      string trackingToken,
      TicketPdfController controller
    ) =>
    {
      return await controller.GetByTrackingToken(
        trackingToken
      );
    });
  }
}