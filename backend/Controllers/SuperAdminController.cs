using backend.Daos;
using backend.Services;

namespace backend.Controllers;

public class SuperAdminController(
  SuperAdminDao dao,
  TenantDeletionService tenantDeletionService)
{
  public async Task<IResult> GetAdmins()
  {
    return Results.Ok(new
    {
      status = true,
      data = await dao.GetAdmins()
    });
  }

  public async Task<IResult> GetCompanies()
  {
    return Results.Ok(new
    {
      status = true,
      data = await dao.GetCompanies()
    });
  }

  public async Task<IResult> GetStats()
  {
    return Results.Ok(new
    {
      status = true,
      data = await dao.GetStats()
    });
  }

  public async Task<IResult> DeleteAdmin(int adminId)
  {
    var result = await tenantDeletionService.DeleteAdminAsync(adminId);

    return result switch
    {
      AdminTenantDeletionResult.Deleted => Results.Ok(new
      {
        status = true,
        message = "ADMIN and associated tenant data deleted"
      }),
      AdminTenantDeletionResult.NotFound => Results.NotFound(new
      {
        status = false,
        message = "User not found"
      }),
      AdminTenantDeletionResult.NotAdmin => Results.BadRequest(new
      {
        status = false,
        message = "Only ADMIN users can be deleted through this endpoint"
      }),
      _ => Results.Conflict(new
      {
        status = false,
        message = "Cannot delete companies shared with another ADMIN"
      })
    };
  }
}
