// Κοινά δεδομένα organization που χρησιμοποιούνται στα setup/wizard screens.
export interface CompanySummary {
  id: number;
  name: string;
  missedTicketExpiryMinutes: number;
  defaultEstimatedServiceMinutes: number;
  createdAt: string;
}
