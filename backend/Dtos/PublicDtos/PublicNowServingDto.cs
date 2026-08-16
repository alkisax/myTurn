namespace backend.Dtos.PublicDtos;

public record PublicNowServingDto(
  int QueueId,
  string QueueName,
  int Number,
  int DeskId,
  string DeskName,
  DateTime? ServingStartedAt
);
