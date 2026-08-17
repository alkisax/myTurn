import { useEffect, useState } from "react";
import axios from "axios";

import { backendUrl } from "../../constants/constants";
import type { CompanySummary } from "../../types/company.types";
import type { Location } from "../../types/location.types";
import type { Roles } from "../../authLogin/types/types";

interface StaffMember {
  id: number;
  username: string;
  name?: string;
  email?: string;
  role: Roles;
  createdAt: string;
  updatedAt: string;
}

// Hook που διαχειρίζεται τα δεδομένα του βήματος ενεργειών organization.
// Το Step4CompanyActions κρατά μόνο την εμφάνιση και τα child forms.
const useCompanySetupActions = (company: CompanySummary) => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  // Αρχική φόρτωση staff και locations της επιλεγμένης organization.
  useEffect(() => {
    let ignore = false;
    const token = localStorage.getItem("token");

    axios
      .get(`${backendUrl}/company-users/company/${company.id}/staff`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (!ignore) {
          setStaff(response.data.data);
        }
      })
      .catch((error) => {
        if (!ignore) {
          console.error("Failed to fetch staff:", error);
        }
      });

    return () => {
      ignore = true;
    };
  }, [company.id]);

  useEffect(() => {
    let ignore = false;
    const token = localStorage.getItem("token");

    axios
      .get(`${backendUrl}/locations/company/${company.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (!ignore) {
          setLocations(response.data.data);
        }
      })
      .catch((error) => {
        if (!ignore) {
          console.error("Failed to fetch locations:", error);
        }
      });

    return () => {
      ignore = true;
    };
  }, [company.id]);

  // Ξαναφορτώνει τον staff μετά τη δημιουργία staff member.
  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${backendUrl}/company-users/company/${company.id}/staff`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setStaff(response.data.data);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    }
  };

  // Ξαναφορτώνει τις locations μετά τη δημιουργία location.
  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${backendUrl}/locations/company/${company.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setLocations(response.data.data);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    }
  };

  return {
    staff,
    locations,
    fetchStaff,
    fetchLocations,
  };
};

export default useCompanySetupActions;
