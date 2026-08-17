// Service δεδομένα που εμφανίζονται στο setup wizard.
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
