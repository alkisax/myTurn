// Backend\Dtos\CompanyDto.cs
namespace backend;

public record CompanyDto
(
    int Id,
    string Name,
    int MissedTicketExpiryMinutes,
    DateTime CreatedAt
);
