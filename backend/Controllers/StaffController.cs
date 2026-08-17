using backend.Dtos.StaffDtos;
using System.Security.Claims;

namespace backend.Controllers;

public class StaffController(
  StaffDiscoveryDao discoveryDao,
  CompanyUserDao companyUserDao
)
{
  public async Task<IResult> GetDesks(int companyId, ClaimsPrincipal currentUser)
  {
    var role = currentUser.FindFirst(ClaimTypes.Role)?.Value;
    if (role != "SUPERADMIN")
    {
      var userIdValue = currentUser.FindFirst("id")?.Value;
      if (!int.TryParse(userIdValue, out var userId) ||
          await companyUserDao.GetByUserAndCompany(userId, companyId) is null)
      {
        return Results.Forbid();
      }
    }

    int? currentUserId = null;
    var currentUserIdValue = currentUser.FindFirst("id")?.Value;
    if (int.TryParse(currentUserIdValue, out var parsedUserId))
    {
      currentUserId = parsedUserId;
    }

    var desks = await discoveryDao.GetDesksByCompanyId(companyId, currentUserId);
    return Results.Ok(new { status = true, data = desks });
  }
}
