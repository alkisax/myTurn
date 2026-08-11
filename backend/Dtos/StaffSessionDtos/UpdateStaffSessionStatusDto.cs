// backend\Dtos\StaffSessionDtos\UpdateStaffSessionStatusDto.cs
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.StaffSessionDtos;

public record UpdateStaffSessionStatusDto(
  [Required]
  string Status
);