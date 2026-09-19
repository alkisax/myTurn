using System.Security.Claims;
using backend.Dtos.CompanyUserDtos;
using backend.Dtos.SuperAdminDtos;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public enum UserAdStatusResult
{
  Success,
  Unauthorized,
  Forbidden,
  NotFound
}

public sealed record UserAdStatusOperation(
  UserAdStatusResult Result,
  UserAdStatusDto? Status = null
);

public class UserAdStatusService(MyTurnContext db)
{
  public async Task<UserAdStatusOperation> GetMineAsync(
    ClaimsPrincipal currentUser)
  {
    var userId = GetUserId(currentUser);

    if (userId is null)
    {
      return new(UserAdStatusResult.Unauthorized);
    }

    if (!await HasMembershipAsync(userId.Value))
    {
      return new(UserAdStatusResult.Forbidden);
    }

    var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(
      candidate => candidate.Id == userId.Value);

    return user is null
      ? new(UserAdStatusResult.NotFound)
      : Success(user);
  }

  public async Task<UserAdStatusOperation> GrantMineAsync(
    ClaimsPrincipal currentUser)
  {
    var userId = GetUserId(currentUser);

    if (userId is null)
    {
      return new(UserAdStatusResult.Unauthorized);
    }

    if (!await HasMembershipAsync(userId.Value))
    {
      return new(UserAdStatusResult.Forbidden);
    }

    var user = await db.Users.FirstOrDefaultAsync(
      candidate => candidate.Id == userId.Value);

    if (user is null)
    {
      return new(UserAdStatusResult.NotFound);
    }

    if (!user.HasPaid)
    {
      user.AdFreeUntil = DateTime.UtcNow.AddHours(10);
      user.UpdatedAt = DateTime.UtcNow;
      await db.SaveChangesAsync();
    }

    return Success(user);
  }

  public async Task<UserAdStatusOperation> OverrideAsync(
    int userId,
    UpdateUserAdStatusDto data)
  {
    var user = await db.Users.FirstOrDefaultAsync(
      candidate => candidate.Id == userId);

    if (user is null)
    {
      return new(UserAdStatusResult.NotFound);
    }

    user.HasPaid = data.HasPaid;
    user.AdFreeUntil = data.AdFreeUntil;
    user.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();

    return Success(user);
  }

  private async Task<bool> HasMembershipAsync(int userId) =>
    await db.CompanyUsers.AnyAsync(membership => membership.UserId == userId);

  private static int? GetUserId(ClaimsPrincipal currentUser)
  {
    var userIdValue = currentUser.FindFirst("id")?.Value;
    return int.TryParse(userIdValue, out var userId) ? userId : null;
  }

  private static UserAdStatusOperation Success(backend.auth.Models.User user) =>
    new(
      UserAdStatusResult.Success,
      new UserAdStatusDto(user.HasPaid, user.AdFreeUntil));
}
