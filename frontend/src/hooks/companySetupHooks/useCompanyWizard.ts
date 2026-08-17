import { useEffect, useState } from "react";
import axios from "axios";

import { backendUrl } from "../../constants/constants";
import type { CompanySummary } from "../../types/company.types";
import type { Location } from "../../types/location.types";

// Hook που κρατά την κατάσταση και τη ροή επιλογής του Company Wizard.
// Το CompanyWizard χρησιμοποιεί τα δεδομένα για να εμφανίσει το σωστό βήμα.
const useCompanyWizard = (isAdmin: boolean) => {
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null,
  );
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );

  // Αρχική φόρτωση των organizations που μπορεί να διαχειριστεί ο admin.
  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    let ignore = false;
    const token = localStorage.getItem("token");

    axios
      .get(`${backendUrl}/companies/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (!ignore) {
          setCompanies(response.data.data);
        }
      })
      .catch((error) => {
        if (!ignore) {
          console.error("Failed to fetch companies:", error);
        }
      })
      .finally(() => {
        if (!ignore) {
          setCompanyLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [isAdmin]);

  // Ξαναφορτώνει τα organizations μετά τη δημιουργία νέου organization.
  const fetchCompanies = async () => {
    if (!isAdmin) {
      return;
    }

    setCompanyLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${backendUrl}/companies/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCompanies(response.data.data);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    } finally {
      setCompanyLoading(false);
    }
  };

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
