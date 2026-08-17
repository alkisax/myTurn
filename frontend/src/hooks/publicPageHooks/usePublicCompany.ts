import { useEffect, useState } from "react";
import axios from "axios";

import { backendUrl } from "../../constants/constants";
import type {
  PublicCompany,
  PublicLocationSummary,
} from "../../types/public.types";

type PublicCompanyData = PublicCompany & { slug: string };

// Φορτώνει τα δημόσια στοιχεία της organization και τις διαθέσιμες locations.
const usePublicCompany = (companySlug: string | undefined) => {
  const [company, setCompany] = useState<PublicCompanyData | null>(null);
  const [locations, setLocations] = useState<PublicLocationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Αρχική φόρτωση company και locations όταν αλλάζει το company slug.
  useEffect(() => {
    if (!companySlug) {
      return;
    }

    let ignore = false;
    const publicBase = `${backendUrl}/public/${companySlug}`;

    Promise.all([axios.get(publicBase), axios.get(`${publicBase}/locations`)])
      .then(([companyResponse, locationsResponse]) => {
        if (ignore) {
          return;
        }

        setCompany(companyResponse.data.data);
        setLocations(locationsResponse.data.data);
      })
      .catch((error: unknown) => {
        if (!ignore) {
          const message =
            axios.isAxiosError(error) && error.response?.status === 404
              ? "Company not found"
              : "Unable to load company locations";

          setErrorMessage(message);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [companySlug]);

  return {
    company,
    locations,
    loading,
    errorMessage,
  };
};

export default usePublicCompany;
