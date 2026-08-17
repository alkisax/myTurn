import { useEffect, useState } from "react";
import axios from "axios";

import { backendUrl } from "../../constants/constants";
import type {
  PublicCompany,
  PublicLocationDetails,
  PublicQueue,
} from "../../types/public.types";

// Φορτώνει location και queues και κρατά μόνο queues με remote ticketing.
const usePublicLocation = (
  companySlug: string | undefined,
  locationSlug: string | undefined,
) => {
  const [company, setCompany] = useState<PublicCompany | null>(null);
  const [location, setLocation] = useState<PublicLocationDetails | null>(null);
  const [queues, setQueues] = useState<PublicQueue[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Φορτώνουμε τα public δεδομένα όταν αλλάζει company ή location.
  useEffect(() => {
    if (!companySlug || !locationSlug) {
      return;
    }

    let ignore = false;
    const publicBase = `${backendUrl}/public/${companySlug}`;
    const locationBase = `${publicBase}/${locationSlug}`;

    Promise.all([
      axios.get(publicBase),
      axios.get(locationBase),
      axios.get(`${locationBase}/queues`),
    ])
      .then(([companyResponse, locationResponse, queuesResponse]) => {
        if (ignore) {
          return;
        }

        setCompany(companyResponse.data.data);
        setLocation(locationResponse.data.data);
        setQueues(
          queuesResponse.data.data.filter(
            (queue: PublicQueue) => queue.isRemoteTicketingAllowed,
          ),
        );
      })
      .catch((error: unknown) => {
        if (!ignore) {
          const message =
            axios.isAxiosError(error) && error.response?.status === 404
              ? "Company or location not found"
              : "Unable to load location queues";

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
  }, [companySlug, locationSlug]);

  return {
    company,
    location,
    queues,
    loading,
    errorMessage,
  };
};

export default usePublicLocation;
