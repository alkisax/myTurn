using System.ComponentModel.DataAnnotations;

namespace backend;

public record class CreateCompanyDto
(
  [Required]
  [StringLength(100)]
  string Name
);
