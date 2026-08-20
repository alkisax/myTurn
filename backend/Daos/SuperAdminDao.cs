using backend.Dtos.SuperAdminDtos;
using Microsoft.EntityFrameworkCore;

namespace backend.Daos;

public class SuperAdminDao(MyTurnContext db)
{
  public async Task<List<SuperAdminAdminDto>> GetAdmins()
  {
    var admins = await db.Users
      .AsNoTracking()
      .Where(user => user.Role == "ADMIN")
      .OrderBy(user => user.Id)
      .ToListAsync();

    var memberships = await (
      from membership in db.CompanyUsers.AsNoTracking()
      join company in db.Companies.AsNoTracking()
        on membership.CompanyId equals company.Id
      join user in db.Users.AsNoTracking()
        on membership.UserId equals user.Id
      where user.Role == "ADMIN"
      select new
      {
        membership.UserId,
        membership.CreatedAt,
        Company = company
      }).ToListAsync();

    var adminCounts = await db.CompanyUsers
      .AsNoTracking()
      .Join(
        db.Users,
        membership => membership.UserId,
        user => user.Id,
        (membership, user) => new { membership.CompanyId, user.Role })
      .Where(item => item.Role == "ADMIN")
      .GroupBy(item => item.CompanyId)
      .Select(group => new { CompanyId = group.Key, Count = group.Count() })
      .ToDictionaryAsync(item => item.CompanyId, item => item.Count);

    return admins.Select(admin => new SuperAdminAdminDto(
      admin.Id,
      admin.Username,
      admin.Name,
      admin.Email,
      admin.Role,
      admin.CreatedAt,
      admin.UpdatedAt,
      memberships
        .Where(item => item.UserId == admin.Id)
        .Select(item => new SuperAdminCompanyLinkDto(
          item.Company.Id,
          item.Company.Name,
          item.Company.Slug,
          item.CreatedAt,
          adminCounts.GetValueOrDefault(item.Company.Id)))
        .ToList()
    )).ToList();
  }

  public async Task<List<SuperAdminCompanyDto>> GetCompanies()
  {
    var companies = await db.Companies
      .AsNoTracking()
      .OrderBy(company => company.Id)
      .ToListAsync();

    var admins = await (
      from membership in db.CompanyUsers.AsNoTracking()
      join user in db.Users.AsNoTracking()
        on membership.UserId equals user.Id
      where user.Role == "ADMIN"
      select new { membership.CompanyId, User = user }
    ).ToListAsync();

    var staffCounts = await GetRoleCountsByCompany("STAFF");
    var locationCounts = await db.Locations
      .GroupBy(location => location.CompanyId)
      .Select(group => new { CompanyId = group.Key, Count = group.Count() })
      .ToDictionaryAsync(item => item.CompanyId, item => item.Count);
    var queueCounts = await db.Queues
      .GroupBy(queue => queue.CompanyId)
      .Select(group => new { CompanyId = group.Key, Count = group.Count() })
      .ToDictionaryAsync(item => item.CompanyId, item => item.Count);
    var activeQueueCounts = await db.Queues
      .Where(queue => queue.IsActive)
      .GroupBy(queue => queue.CompanyId)
      .Select(group => new { CompanyId = group.Key, Count = group.Count() })
      .ToDictionaryAsync(item => item.CompanyId, item => item.Count);
    var deskCounts = await db.Desks
      .GroupBy(desk => desk.CompanyId)
      .Select(group => new { CompanyId = group.Key, Count = group.Count() })
      .ToDictionaryAsync(item => item.CompanyId, item => item.Count);
    var serviceCounts = await db.Services
      .GroupBy(service => service.CompanyId)
      .Select(group => new { CompanyId = group.Key, Count = group.Count() })
      .ToDictionaryAsync(item => item.CompanyId, item => item.Count);
    var ticketCounts = await db.Tickets
      .GroupBy(ticket => ticket.CompanyId)
      .Select(group => new { CompanyId = group.Key, Count = group.Count() })
      .ToDictionaryAsync(item => item.CompanyId, item => item.Count);

    return companies.Select(company =>
    {
      var companyAdmins = admins
        .Where(item => item.CompanyId == company.Id)
        .Select(item => new SuperAdminUserDto(
          item.User.Id,
          item.User.Username,
          item.User.Name,
          item.User.Email))
        .ToList();

      var staffCount = staffCounts.GetValueOrDefault(company.Id);
      var locationCount = locationCounts.GetValueOrDefault(company.Id);

      return new SuperAdminCompanyDto(
        company.Id,
        company.Name,
        company.Slug,
        company.CreatedAt,
        companyAdmins,
        staffCount,
        locationCount,
        queueCounts.GetValueOrDefault(company.Id),
        deskCounts.GetValueOrDefault(company.Id),
        serviceCounts.GetValueOrDefault(company.Id),
        ticketCounts.GetValueOrDefault(company.Id),
        companyAdmins.Count == 0,
        companyAdmins.Count > 1,
        staffCount == 0,
        locationCount == 0,
        activeQueueCounts.GetValueOrDefault(company.Id) == 0);
    }).ToList();
  }

  public async Task<SuperAdminStatsDto> GetStats()
  {
    var companies = await db.Companies.CountAsync();
    var adminUsers = await db.Users.CountAsync(user => user.Role == "ADMIN");
    var staffUsers = await db.Users.CountAsync(user => user.Role == "STAFF");
    var locations = await db.Locations.CountAsync();
    var queues = await db.Queues.CountAsync();
    var desks = await db.Desks.CountAsync();
    var services = await db.Services.CountAsync();
    var tickets = await db.Tickets.CountAsync();
    var staffSessions = await db.StaffSessions.CountAsync();

    var companiesWithoutAdmin = await db.Companies
      .CountAsync(company => !db.CompanyUsers.Any(membership =>
        membership.CompanyId == company.Id &&
        db.Users.Any(user => user.Id == membership.UserId && user.Role == "ADMIN")));
    var companiesWithMultipleAdmins = await db.Companies
      .CountAsync(company => db.CompanyUsers.Count(membership =>
        membership.CompanyId == company.Id &&
        db.Users.Any(user => user.Id == membership.UserId && user.Role == "ADMIN")) > 1);
    var companiesWithoutStaff = await db.Companies
      .CountAsync(company => !db.CompanyUsers.Any(membership =>
        membership.CompanyId == company.Id &&
        db.Users.Any(user => user.Id == membership.UserId && user.Role == "STAFF")));
    var companiesWithoutLocations = await db.Companies
      .CountAsync(company => !db.Locations.Any(location => location.CompanyId == company.Id));
    var companiesWithoutActiveQueues = await db.Companies
      .CountAsync(company => !db.Queues.Any(queue =>
        queue.CompanyId == company.Id && queue.IsActive));

    return new SuperAdminStatsDto(
      companies,
      adminUsers,
      staffUsers,
      locations,
      queues,
      desks,
      services,
      tickets,
      staffSessions,
      companiesWithoutAdmin,
      companiesWithMultipleAdmins,
      companiesWithoutStaff,
      companiesWithoutLocations,
      companiesWithoutActiveQueues);
  }

  private async Task<Dictionary<int, int>> GetRoleCountsByCompany(string role)
  {
    return await db.CompanyUsers
      .Join(
        db.Users,
        membership => membership.UserId,
        user => user.Id,
        (membership, user) => new { membership.CompanyId, user.Role })
      .Where(item => item.Role == role)
      .GroupBy(item => item.CompanyId)
      .Select(group => new { CompanyId = group.Key, Count = group.Count() })
      .ToDictionaryAsync(item => item.CompanyId, item => item.Count);
  }
}
