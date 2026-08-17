// DTOs που επιστρέφουν τα Admin endpoints για τις βασικές οντότητες.
export interface AdminCompany {
  id: number;
  name: string;
  slug: string;
  missedTicketExpiryMinutes: number;
  defaultEstimatedServiceMinutes: number;
  createdAt: string;
}

export interface AdminLocation {
  id: number;
  companyId: number;
  name: string;
  slug: string;
  address: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  timeZoneId: string | null;
  isActive: boolean;
}

export interface AdminQueue {
  id: number;
  locationId: number;
  name: string;
  description: string | null;
  isActive: boolean;
  isRemoteTicketingAllowed: boolean;
  defaultServiceMinutes: number | null;
  maxWaitingTickets: number | null;
  opensAt: string | null;
  closesAt: string | null;
  resetNumberDaily: boolean;
  autoResetEnabled: boolean;
  resetAt: string | null;
}

export interface AdminService {
  id: number;
  locationId: number;
  queueId: number;
  name: string;
  description: string | null;
  estimatedServiceMinutes: number | null;
  isActive: boolean;
  isGeneric: boolean;
}

export interface AdminDesk {
  id: number;
  companyId: number;
  locationId: number;
  queueId: number;
  name: string;
  isActive: boolean;
}

export interface AdminStaffMember {
  id: number;
  username: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}
