namespace backend;

public class AnalyticsService(AnalyticsDao dao)
{
  public Task<CompanyOverviewResult> GetCompanyOverview(int companyId) => dao.GetCompanyOverview(companyId);
  public Task<List<TicketsByHourResult>> GetTicketsByHour(int companyId) => dao.GetTicketsByHour(companyId);
  public Task<List<TicketsByStaffResult>> GetTicketsByStaff(int companyId) => dao.GetTicketsByStaff(companyId);
  public Task<List<TicketsByServiceResult>> GetTicketsByService(int companyId) => dao.GetTicketsByService(companyId);
  public Task<List<TicketsByLocationResult>> GetTicketsByLocation(int companyId) => dao.GetTicketsByLocation(companyId);
  public Task<List<TicketsByQueueResult>> GetTicketsByQueue(int companyId) => dao.GetTicketsByQueue(companyId);
  public Task<List<PeakHourResult>> GetPeakHours(int companyId) => dao.GetPeakHours(companyId);
  public async Task<CompletionStatsResult> GetCompletionStats(int companyId)
  {
    var result = await dao.GetCompletionStats(companyId);
    result.CompletionRate = result.TotalTickets == 0 ? 0 : result.Completed * 100.0 / result.TotalTickets;
    return result;
  }
}
