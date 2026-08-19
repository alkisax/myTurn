import { useCallback, useEffect, useState } from "react";
import { backendUrl } from "@/constants/constants";
import type {
  CompanySummary,
  LocationSummary,
  StaffMember,
} from "@/types/companySetup.types";
import { api, getAuthHeaders } from "./api";

const useCompanySetupActions = (company: CompanySummary) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [locations, setLocations] = useState<LocationSummary[]>([]);

  const fetchStaff = useCallback(async () => {
    try {
      const response = await api.get(
        `${backendUrl}/company-users/company/${company.id}/staff`,
        await getAuthHeaders(),
      );
      setStaff(response.data.data);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    }
  }, [company.id]);

  const fetchLocations = useCallback(async () => {
    try {
      const response = await api.get(
        `${backendUrl}/locations/company/${company.id}`,
        await getAuthHeaders(),
      );
      setLocations(response.data.data);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    }
  }, [company.id]);

  useEffect(() => {
    void fetchStaff();
    void fetchLocations();
  }, [fetchLocations, fetchStaff]);

  return { staff, locations, fetchStaff, fetchLocations };
};

export default useCompanySetupActions;
