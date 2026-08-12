// backend\Dtos\TicketDtos\MyTicketDto.cs

using backend.Dtos.TicketServiceDtos;
namespace backend.Dtos.TicketDtos;

// γενικό dto μη public με όλα μέσα
public record MyTicketDto(
  int Id,
  int CompanyId,
  int LocationId,
  int QueueId,
  int Number,
  string Pin,
  string TrackingToken,
  string? CustomerEmail,
  string Status,
  DateTime CreatedAt,
  DateTime? ServingStartedAt,
  DateTime? CompletedAt,
  List<TicketServiceInfoDto>? Services = null
);