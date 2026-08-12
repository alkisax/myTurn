namespace backend.Dtos.TicketServiceDtos;

public record TicketServiceDto(
  int Id,
  int TicketId,
  int ServiceId,
  DateTime CreatedAt
);