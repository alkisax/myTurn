export interface PublicLocationSummary {
  id: number;
  name: string;
  slug: string;
  address?: string | null;
  country?: string | null;
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
