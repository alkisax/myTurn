// backend\Dtos\StaffSessionDtos\CreateStaffSessionDto.cs
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.StaffSessionDtos;

public record CreateStaffSessionDto(
  [Required]
  int DeskId
);