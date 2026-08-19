export interface CompanySummary {
  id: number;
  name: string;
  missedTicketExpiryMinutes: number;
  defaultEstimatedServiceMinutes: number;
  createdAt: string;
}

export interface LocationSummary {
  id: number;
  companyId: number;
  name: string;
  address: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  timeZoneId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QueueSummary {
  id: number;
  companyId: number;
  locationId: number;
  name: string;
}

export interface ServiceSummary {
  id: number;
  companyId: number;
  locationId: number;
  name: string;
  description?: string | null;
  isActive: boolean;
  isGeneric: boolean;
  estimatedServiceMinutes?: number | null;
}

export interface DeskSummary {
  id: number;
  companyId: number;
  locationId: number;
  queueId: number;
  name: string;
  isActive: boolean;
}

export interface StaffMember {
  id: number;
  username: string;
  name?: string;
  email?: string;
  role: "STAFF" | "ADMIN" | "SUPERADMIN" | "USER";
  createdAt: string;
  updatedAt: string;
}
