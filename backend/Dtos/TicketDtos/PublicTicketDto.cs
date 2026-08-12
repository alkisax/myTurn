// backend\Dtos\TicketDtos\PublicTicketDto.cs

using backend.Dtos.TicketServiceDtos;
namespace backend.Dtos.TicketDtos;

// o χρήστης θα ακολουθάει ένα qr και θα βλέπει τις πληροφορίες το ticket του
// Δεν επιστρέφουμε: UserId CustomerEmail TrackingToken ServedByUserId
public record TicketTrackingDto(
  int Id,
  int CompanyId,
  int LocationId,
  int QueueId,
  int Number,
  string Pin,
  string Status,
  DateTime CreatedAt,
  DateTime? ServingStartedAt,
  DateTime? CompletedAt,
  List<TicketServiceInfoDto>? Services = null
);