// backend\Dtos\TicketDtos\CreateTicketDto.cs

using System.ComponentModel.DataAnnotations;

namespace backend.Dtos.TicketDtos;

public record CreateTicketDto(
  [Required]
  int QueueId,

  [EmailAddress]
  string? Email,

  List<int>? ServiceIds
);