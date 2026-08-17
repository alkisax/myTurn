// DTOs των anonymous public/customer-facing endpoints.
export interface PublicCompany {
  name: string;
  slug?: string;
}

export interface PublicLocationSummary {
  id: number;
  name: string;
  slug: string;
  address?: string | null;
  country?: string | null;
}

export interface PublicLocationDetails {
  name: string;
  address?: string | null;
  country?: string | null;
}

export interface PublicQueue {
  id: number;
  name: string;
  description?: string | null;
  isRemoteTicketingAllowed: boolean;
}

export interface PublicTabletQueue {
  id: number;
  name: string;
  isActive: boolean;
}

export interface PublicService {
  id: number;
  name: string;
  description?: string | null;
}
