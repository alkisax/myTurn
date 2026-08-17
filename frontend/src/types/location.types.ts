// Κοινά δεδομένα location και η μικρή μορφή για selectors.
export interface Location {
  id: number;
  companyId: number;
  name: string;
  address?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timeZoneId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocationOption {
  id: number;
  name: string;
}
