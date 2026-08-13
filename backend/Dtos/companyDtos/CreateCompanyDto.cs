using System.ComponentModel.DataAnnotations;

namespace backend;

public record class CreateCompanyDto
(
  [Required]
  [StringLength(100)]
  string Name,

  [Range(1, int.MaxValue)] // η μέγιστη τιμή που μπορεί να πάρει το int
  int MissedTicketExpiryMinutes = 10,

  [Range(1, int.MaxValue)]
  int DefaultEstimatedServiceMinutes = 5
);
