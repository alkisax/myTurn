// Κοινά STAFF domain/API δεδομένα για επιλογή organization, desk και session.
export interface Company {
  id: number;
  name: string;
  slug: string;
}

export interface StaffDesk {
  id: number;
  name: string;
  locationId: number;
  locationName: string;
  queueId: number;
  queueName: string;
  isActive: boolean;
}

export interface StaffSession {
  id: number;
  userId: number;
  companyId: number;
  locationId: number;
  queueId: number;
  deskId: number;
  status: string;
  startedAt: string;
  breakStartedAt: string | null;
  totalBreakSeconds: number;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TicketIdentification {
  number: number;
  queueName: string;
  status: string;
  services: Array<{ id: number; name: string }>;
}
