using backend.Controllers;

namespace backend.Endpoints;

public static class PublicEndpoints
{
  public static void MapPublicEndpoints(this WebApplication app)
  {
    var group = app.MapGroup("/public");

    group.MapGet("/{companySlug}", (string companySlug, PublicController controller) =>
      controller.GetCompany(companySlug));
    group.MapGet("/{companySlug}/locations", (string companySlug, PublicController controller) =>
      controller.GetLocations(companySlug));
    group.MapGet("/{companySlug}/{locationSlug}", (string companySlug, string locationSlug, PublicController controller) =>
      controller.GetLocation(companySlug, locationSlug));
    group.MapGet("/{companySlug}/{locationSlug}/queues", (string companySlug, string locationSlug, PublicController controller) =>
      controller.GetQueues(companySlug, locationSlug));
    group.MapGet("/{companySlug}/{locationSlug}/services", (string companySlug, string locationSlug, PublicController controller) =>
      controller.GetServices(companySlug, locationSlug));
    group.MapGet("/{companySlug}/{locationSlug}/now-serving", (string companySlug, string locationSlug, PublicController controller) =>
      controller.GetNowServing(companySlug, locationSlug));
  }
}
