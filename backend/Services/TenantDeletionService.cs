using backend.auth.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public enum AdminTenantDeletionResult
{
  Deleted,
  NotFound,
  NotAdmin,
  SharedAdminCompany
}

public class TenantDeletionService(MyTurnContext db)
{
  public async Task<AdminTenantDeletionResult> DeleteAdminAsync(int adminId)
  {
    await using var transaction = await db.Database.BeginTransactionAsync();

    var admin = await db.Users.FindAsync(adminId);

    if (admin is null)
    {
      return AdminTenantDeletionResult.NotFound;
    }

    if (admin.Role != "ADMIN")
    {
      return AdminTenantDeletionResult.NotAdmin;
    }

    var companyIds = await db.CompanyUsers
      .Where(membership => membership.UserId == adminId)
      .Select(membership => membership.CompanyId)
      .ToListAsync();

    var hasSharedAdminCompany = await db.CompanyUsers
      .Where(membership =>
        companyIds.Contains(membership.CompanyId) &&
        membership.UserId != adminId)
      .Join(
        db.Users,
        membership => membership.UserId,
        user => user.Id,
        (membership, user) => user.Role)
      .AnyAsync(role => role == "ADMIN");

    if (hasSharedAdminCompany)
    {
      return AdminTenantDeletionResult.SharedAdminCompany;
    }

    var staffIds = await db.CompanyUsers
      .Where(membership =>
        companyIds.Contains(membership.CompanyId) &&
        membership.UserId != adminId)
      .Join(
        db.Users,
        membership => membership.UserId,
        user => user.Id,
        (membership, user) => new { user.Id, user.Role })
      .Where(user => user.Role == "STAFF")
      .Select(user => user.Id)
      .Distinct()
      .ToListAsync();

    var ticketIds = await db.Tickets
      .Where(ticket => companyIds.Contains(ticket.CompanyId))
      .Select(ticket => ticket.Id)
      .ToListAsync();

    var serviceIds = await db.Services
      .Where(service => companyIds.Contains(service.CompanyId))
      .Select(service => service.Id)
      .ToListAsync();

    var ticketServices = await db.TicketServices
      .Where(ticketService =>
        ticketIds.Contains(ticketService.TicketId) ||
        serviceIds.Contains(ticketService.ServiceId))
      .ToListAsync();
    var tickets = await db.Tickets
      .Where(ticket => companyIds.Contains(ticket.CompanyId))
      .ToListAsync();
    var staffSessions = await db.StaffSessions
      .Where(session => companyIds.Contains(session.CompanyId))
      .ToListAsync();
    var desks = await db.Desks
      .Where(desk => companyIds.Contains(desk.CompanyId))
      .ToListAsync();
    var services = await db.Services
      .Where(service => companyIds.Contains(service.CompanyId))
      .ToListAsync();
    var queues = await db.Queues
      .Where(queue => companyIds.Contains(queue.CompanyId))
      .ToListAsync();
    var locations = await db.Locations
      .Where(location => companyIds.Contains(location.CompanyId))
      .ToListAsync();
    var memberships = await db.CompanyUsers
      .Where(membership => companyIds.Contains(membership.CompanyId))
      .ToListAsync();

    var remainingStaffMemberships = await db.CompanyUsers
      .Where(membership =>
        staffIds.Contains(membership.UserId) &&
        !companyIds.Contains(membership.CompanyId))
      .Select(membership => membership.UserId)
      .Distinct()
      .ToListAsync();

    var staffUsersToDelete = await db.Users
      .Where(user =>
        staffIds.Contains(user.Id) &&
        !remainingStaffMemberships.Contains(user.Id))
      .ToListAsync();

    var companies = await db.Companies
      .Where(company => companyIds.Contains(company.Id))
      .ToListAsync();

    db.TicketServices.RemoveRange(ticketServices);
    db.Tickets.RemoveRange(tickets);
    db.StaffSessions.RemoveRange(staffSessions);
    db.Desks.RemoveRange(desks);
    db.Services.RemoveRange(services);
    db.Queues.RemoveRange(queues);
    db.Locations.RemoveRange(locations);
    db.CompanyUsers.RemoveRange(memberships);
    db.Users.RemoveRange(staffUsersToDelete);
    db.Companies.RemoveRange(companies);
    db.Users.Remove(admin);

    await db.SaveChangesAsync();
    await transaction.CommitAsync();

    return AdminTenantDeletionResult.Deleted;
  }
}
