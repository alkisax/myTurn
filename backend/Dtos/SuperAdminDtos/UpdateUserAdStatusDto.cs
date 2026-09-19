namespace backend.Dtos.SuperAdminDtos;

public record UpdateUserAdStatusDto(
  bool HasPaid,
  DateTime? AdFreeUntil
);
