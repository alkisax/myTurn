// backend\Dtos\DeskDtos\CreateDeskDto.cs
using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.DeskDtos;

public record CreateDeskDto(
  [Required]
  int LocationId,

  [Required]
  int QueueId,

  [Required]
  [StringLength(100)]
  string Name
);