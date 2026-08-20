namespace backend.Dtos.SuperAdminDtos;

public record SuperAdminUserDto(
  int Id,
  string Username,
  string? Name,
  string? Email
);

public record SuperAdminCompanyLinkDto(
  int Id,
  string Name,
  string Slug,
  DateTime MembershipCreatedAt,
  int AdminCount
);

public record SuperAdminAdminDto(
  int Id,
  string Username,
  string? Name,
  string? Email,
  string Role,
  DateTime CreatedAt,
  DateTime UpdatedAt,
  IReadOnlyList<SuperAdminCompanyLinkDto> Companies
);

public record SuperAdminCompanyDto(
  int Id,
  string Name,
  string Slug,
  DateTime CreatedAt,
  IReadOnlyList<SuperAdminUserDto> Admins,
  int StaffCount,
  int LocationCount,
  int QueueCount,
  int DeskCount,
  int ServiceCount,
  int TicketCount,
  bool HasNoAdmin,
  bool HasMultipleAdmins,
  bool HasNoStaff,
  bool HasNoLocations,
  bool HasNoActiveQueues
);

public record SuperAdminStatsDto(
  int Companies,
  int AdminUsers,
  int StaffUsers,
  int Locations,
  int Queues,
  int Desks,
  int Services,
  int Tickets,
  int StaffSessions,
  int CompaniesWithoutAdmin,
  int CompaniesWithMultipleAdmins,
  int CompaniesWithoutStaff,
  int CompaniesWithoutLocations,
  int CompaniesWithoutActiveQueues
);
