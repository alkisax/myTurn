import { useCallback, useEffect, useState } from "react";
import { backendUrl } from "@/constants/constants";
import type {
  CompanySummary,
  LocationSummary,
} from "@/types/companySetup.types";
import { api, getAuthHeaders } from "./api";

const useCompanyWizard = (isAdmin: boolean) => {
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null,
  );
  const [selectedLocation, setSelectedLocation] =
    useState<LocationSummary | null>(null);

  const fetchCompanies = useCallback(async () => {
    if (!isAdmin) {
      setCompanyLoading(false);
      return;
    }

    setCompanyLoading(true);

    try {
      const response = await api.get(
        `${backendUrl}/companies/mine`,
        await getAuthHeaders(),
      );
      setCompanies(response.data.data);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    } finally {
      setCompanyLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    void fetchCompanies();
  }, [fetchCompanies]);

  return {
    companies,
    companyLoading,
    showCompanyForm,
    setShowCompanyForm,
    selectedCompanyId,
    setSelectedCompanyId,
    selectedLocation,
    setSelectedLocation,
    fetchCompanies,
  };
};

export default useCompanyWizard;
