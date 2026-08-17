import { useEffect, useState } from "react";
import axios from "axios";

import { backendUrl } from "../../constants/constants";
import type {
  PublicCompany,
  PublicLocationDetails,
  PublicQueue,
  PublicService,
} from "../../types/public.types";

// Hook για τη φόρτωση queue/services και τη δημιουργία anonymous remote ticket.
const usePublicRemoteTicket = (
  companySlug: string | undefined,
  locationSlug: string | undefined,
  queueId: string | undefined,
) => {
  const [company, setCompany] = useState<PublicCompany | null>(null);
  const [location, setLocation] = useState<PublicLocationDetails | null>(null);
  const [queue, setQueue] = useState<PublicQueue | null>(null);
  const [services, setServices] = useState<PublicService[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadErrorMessage, setLoadErrorMessage] = useState("");
  const [submitErrorMessage, setSubmitErrorMessage] = useState("");

  // Φορτώνουμε company, location, την επιλεγμένη queue και τα services της.
  useEffect(() => {
    if (!companySlug || !locationSlug || !queueId) {
      return;
    }

    let ignore = false;
    const publicBase = `${backendUrl}/public/${companySlug}`;
    const locationBase = `${publicBase}/${locationSlug}`;

    Promise.all([
      axios.get(publicBase),
      axios.get(locationBase),
      axios.get(`${locationBase}/queues`),
      axios.get(`${locationBase}/queues/${queueId}/services`),
    ])
      .then(
        ([
          companyResponse,
          locationResponse,
          queuesResponse,
          servicesResponse,
        ]) => {
          if (ignore) {
            return;
          }

          const selectedQueue = (
            queuesResponse.data.data as PublicQueue[]
          ).find((item) => item.id === Number(queueId));

          setCompany(companyResponse.data.data);
          setLocation(locationResponse.data.data);
          setQueue(selectedQueue ?? null);
          setServices(servicesResponse.data.data);

          if (!selectedQueue || !selectedQueue.isRemoteTicketingAllowed) {
            setLoadErrorMessage(
              "This queue is not available for remote ticketing",
            );
          }
        },
      )
      .catch((error: unknown) => {
        if (!ignore) {
          const message =
            axios.isAxiosError(error) && error.response?.status === 404
              ? "Company, location, or queue not found"
              : "Unable to load ticket options";

          setLoadErrorMessage(message);
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
  }, [companySlug, locationSlug, queueId]);

  // Εναλλάσσει service χωρίς να αλλάζει τη λίστα που έδωσε το API.
  const toggleService = (serviceId: number) => {
    setSelectedServiceIds((current) => {
      if (current.includes(serviceId)) {
        return current.filter((id) => id !== serviceId);
      }

      return [...current, serviceId];
    });
  };

  // Δημιουργεί ticket και επιστρέφει μόνο το tracking token στη Web σελίδα.
  const submitTicket = async () => {
    if (!queue) {
      return null;
    }

    setSubmitting(true);
    setSubmitErrorMessage("");

    try {
      const response = await axios.post(`${backendUrl}/tickets`, {
        queueId: queue.id,
        email: email || null,
        serviceIds: selectedServiceIds,
      });

      return response.data.data.trackingToken as string;
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Unable to create ticket"
        : "Unable to create ticket";

      setSubmitErrorMessage(message);
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    company,
    location,
    queue,
    services,
    selectedServiceIds,
    setSelectedServiceIds,
    email,
    setEmail,
    loading,
    submitting,
    loadErrorMessage,
    submitErrorMessage,
    toggleService,
    submitTicket,
  };
};

export default usePublicRemoteTicket;
