using System.ComponentModel.DataAnnotations;

namespace backend;

public record class UpdateCompanyDto
(
  [Required]
  [StringLength(100)]
  string Name,

  [Range(1, int.MaxValue)]
  int MissedTicketExpiryMinutes
);
