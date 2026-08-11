// backend\Dtos\QueueDtos\CreateQueueDto.cs

using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.QueueDtos;

public record CreateQueueDto(
  [Required]
  int LocationId,

  [Required]
  [StringLength(100)]
  string Name,

  string? Description,

  int? DefaultServiceMinutes,

  int? MaxWaitingTickets,

  TimeOnly? OpensAt,

  TimeOnly? ClosesAt
);