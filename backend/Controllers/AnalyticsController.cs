using System.Security.Claims;

namespace backend;

public class AnalyticsController(AnalyticsService service, CompanyUserDao companyUserDao)
{
  private async Task<bool> HasAccess(int companyId, ClaimsPrincipal user)
  {
    var role = user.FindFirst(ClaimTypes.Role)?.Value;
    if (role == "SUPERADMIN") return true;
    if (role != "ADMIN") return false;
    if (!int.TryParse(user.FindFirst("id")?.Value, out var userId)) return false;
    return await companyUserDao.GetByUserAndCompany(userId, companyId) is not null;
  }

  private async Task<IResult> Execute<T>(int companyId, ClaimsPrincipal user, Func<Task<T>> action)
    => await HasAccess(companyId, user) ? Results.Ok(new { status = true, data = await action() }) : Results.Forbid();

  public Task<IResult> GetCompanyOverview(int companyId, ClaimsPrincipal user) => Execute(companyId, user, () => service.GetCompanyOverview(companyId));
  public Task<IResult> GetTicketsByHour(int companyId, ClaimsPrincipal user) => Execute(companyId, user, () => service.GetTicketsByHour(companyId));
  public Task<IResult> GetTicketsByStaff(int companyId, ClaimsPrincipal user) => Execute(companyId, user, () => service.GetTicketsByStaff(companyId));
  public Task<IResult> GetTicketsByService(int companyId, ClaimsPrincipal user) => Execute(companyId, user, () => service.GetTicketsByService(companyId));
  public Task<IResult> GetTicketsByLocation(int companyId, ClaimsPrincipal user) => Execute(companyId, user, () => service.GetTicketsByLocation(companyId));
  public Task<IResult> GetTicketsByQueue(int companyId, ClaimsPrincipal user) => Execute(companyId, user, () => service.GetTicketsByQueue(companyId));
  public Task<IResult> GetPeakHours(int companyId, ClaimsPrincipal user) => Execute(companyId, user, () => service.GetPeakHours(companyId));
  public Task<IResult> GetCompletionStats(int companyId, ClaimsPrincipal user) => Execute(companyId, user, () => service.GetCompletionStats(companyId));
}
