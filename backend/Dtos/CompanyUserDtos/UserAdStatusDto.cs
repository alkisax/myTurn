namespace backend.Dtos.CompanyUserDtos;

public record UserAdStatusDto(
  bool HasPaid,
  DateTime? AdFreeUntil
);
