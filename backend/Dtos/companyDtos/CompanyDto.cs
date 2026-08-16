// Backend\Dtos\CompanyDto.cs
namespace backend;

public record CompanyDto
(
    int Id,
    string Name,
    string Slug,
    int MissedTicketExpiryMinutes,
    int DefaultEstimatedServiceMinutes,
    DateTime CreatedAt
);
