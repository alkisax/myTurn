namespace backend.Dtos.TicketDtos;

public record TicketIdentificationServiceDto(
  int Id,
  string Name
);

public record TicketIdentificationDto(
  int Number,
  string Pin,
  int QueueId,
  string QueueName,
  string Status,
  List<TicketIdentificationServiceDto> Services
);
