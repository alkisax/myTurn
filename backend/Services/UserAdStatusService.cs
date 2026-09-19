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

    if (user is null)
    {
      return new(UserAdStatusResult.NotFound);
    }

    var relevantUsers = await GetRelevantUsersAsync(userId.Value);
    var now = DateTime.UtcNow;
    var effectiveHasPaid = user.HasPaid || relevantUsers.Any(candidate => candidate.HasPaid);
    var effectiveAdFreeUntil = relevantUsers
      .Select(candidate => candidate.AdFreeUntil)
      .Where(value => value.HasValue && value.Value > now)
      .Max();

    return Success(effectiveHasPaid, effectiveAdFreeUntil);
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

    var relevantUsers = await GetRelevantUsersAsync(userId.Value);
    var now = DateTime.UtcNow;
    var effectiveHasPaid = user.HasPaid || relevantUsers.Any(candidate => candidate.HasPaid);

    if (!effectiveHasPaid)
    {
      var timestamp = now.AddHours(10);
      var userIds = relevantUsers
        .Select(candidate => candidate.Id)
        .Append(userId.Value)
        .Distinct()
        .ToList();
      var usersToUpdate = await db.Users
        .Where(candidate => userIds.Contains(candidate.Id))
        .ToListAsync();

      foreach (var userToUpdate in usersToUpdate)
      {
        userToUpdate.AdFreeUntil = timestamp;
        userToUpdate.UpdatedAt = now;
      }

      await db.SaveChangesAsync();
    }

    return await GetEffectiveStatusAsync(userId.Value);
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

    return await GetEffectiveStatusAsync(userId);
  }

  private async Task<bool> HasMembershipAsync(int userId) =>
    await db.CompanyUsers.AnyAsync(membership => membership.UserId == userId);

  private async Task<List<backend.auth.Models.User>> GetRelevantUsersAsync(
    int userId)
  {
    var companyIds = await db.CompanyUsers
      .Where(membership => membership.UserId == userId)
      .Select(membership => membership.CompanyId)
      .Distinct()
      .ToListAsync();

    var adminIds = await db.CompanyUsers
      .Where(membership => companyIds.Contains(membership.CompanyId))
      .Join(
        db.Users,
        membership => membership.UserId,
        candidate => candidate.Id,
        (membership, candidate) => new { candidate.Id, candidate.Role })
      .Where(candidate => candidate.Role == "ADMIN")
      .Select(candidate => candidate.Id)
      .Distinct()
      .ToListAsync();

    var relevantIds = adminIds.Append(userId).Distinct().ToList();

    return await db.Users
      .AsNoTracking()
      .Where(candidate => relevantIds.Contains(candidate.Id))
      .ToListAsync();
  }

  private async Task<UserAdStatusOperation> GetEffectiveStatusAsync(int userId)
  {
    var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(
      candidate => candidate.Id == userId);

    if (user is null)
    {
      return new(UserAdStatusResult.NotFound);
    }

    var relevantUsers = await GetRelevantUsersAsync(userId);
    var now = DateTime.UtcNow;
    var effectiveHasPaid = user.HasPaid || relevantUsers.Any(candidate => candidate.HasPaid);
    var effectiveAdFreeUntil = relevantUsers
      .Select(candidate => candidate.AdFreeUntil)
      .Where(value => value.HasValue && value.Value > now)
      .Max();

    return Success(effectiveHasPaid, effectiveAdFreeUntil);
  }

  private static int? GetUserId(ClaimsPrincipal currentUser)
  {
    var userIdValue = currentUser.FindFirst("id")?.Value;
    return int.TryParse(userIdValue, out var userId) ? userId : null;
  }

  private static UserAdStatusOperation Success(
    bool hasPaid,
    DateTime? adFreeUntil) =>
    new(
      UserAdStatusResult.Success,
      new UserAdStatusDto(hasPaid, adFreeUntil));
}
