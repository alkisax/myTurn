import { useEffect, useState } from "react";
import axios from "axios";

import { backendUrl } from "../../constants/constants";
import type {
  PublicLocationSummary,
  PublicService,
  PublicTabletQueue,
} from "../../types/public.types";
import type { Company, StaffDesk, StaffSession } from "../../types/staff.types";
import type { TicketResult } from "../../types/ticket.types";

interface Options {
  session: StaffSession | null;
  selectedCompany: Company | undefined;
  selectedDesk: StaffDesk | null;
}

// Hook για τις επιλογές του kiosk και τη δημιουργία ticket μέσω kiosk endpoint.
const usePublicTabletIssueTicket = ({
  session,
  selectedCompany,
  selectedDesk,
}: Options) => {
  const [location, setLocation] = useState<PublicLocationSummary | null>(null);
  const [queues, setQueues] = useState<PublicTabletQueue[]>([]);
  const [services, setServices] = useState<PublicService[]>([]);
  const [email, setEmail] = useState("");
  const [selectedQueueId, setSelectedQueueId] = useState<number | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Φορτώνουμε τη location του desk και τις queues της όταν είναι διαθέσιμη η session.
  useEffect(() => {
    if (!session || !selectedCompany || !selectedDesk) {
      return;
    }

    let ignore = false;
    const publicBase = `${backendUrl}/public/${selectedCompany.slug}`;

    axios
      .get(`${publicBase}/locations`)
      .then((response) => {
        const activeLocation = (
          response.data.data as PublicLocationSummary[]
        ).find((item) => item.id === selectedDesk.locationId);

        if (!activeLocation || ignore) {
          return;
        }

        setLocation(activeLocation);

        return axios
          .get(`${publicBase}/${activeLocation.slug}/queues`)
          .then((queueResponse) => {
            if (!ignore) {
              setQueues(queueResponse.data.data);
            }
          });
      })
      .catch((error: unknown) => {
        if (!ignore) {
          console.error("Failed to load public ticket options:", error);
          setErrorMessage("Failed to load ticket options");
        }
      });

    return () => {
      ignore = true;
    };
  }, [selectedCompany, selectedDesk, session]);

  // Όταν αλλάζει queue, καθαρίζουμε services και την προηγούμενη επιλογή.
  useEffect(() => {
    Promise.resolve().then(() => {
      setSelectedServiceIds([]);
    });

    if (!selectedQueueId || !location || !selectedCompany) {
      Promise.resolve().then(() => {
        setServices([]);
      });
      return;
    }

    let ignore = false;

    axios
      .get(
        `${backendUrl}/public/${selectedCompany.slug}/${location.slug}/queues/${selectedQueueId}/services`,
      )
      .then((response) => {
        if (!ignore) {
          setServices(response.data.data);
        }
      })
      .catch((error: unknown) => {
        if (!ignore) {
          console.error("Failed to load queue services:", error);
          setServices([]);
        }
      });

    return () => {
      ignore = true;
    };
  }, [location, selectedCompany, selectedQueueId]);

  // Εναλλάσσει ένα service στη λίστα επιλογών του ticket.
  const toggleService = (serviceId: number) => {
    setSelectedServiceIds((current) => {
      if (current.includes(serviceId)) {
        return current.filter((id) => id !== serviceId);
      }

      return [...current, serviceId];
    });
  };

  // Δημιουργεί ticket μέσω του υπάρχοντος kiosk endpoint.
  const issueTicket = async (): Promise<TicketResult | null> => {
    if (!selectedQueueId) {
      setErrorMessage("Please choose a queue");
      return null;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post(
        `${backendUrl}/tickets/kiosk`,
        {
          queueId: selectedQueueId,
          email: email || null,
          serviceIds: selectedServiceIds,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      return {
        ticket: response.data.data,
        queueName:
          queues.find((item) => item.id === selectedQueueId)?.name ?? "",
        serviceNames: services
          .filter((service) => selectedServiceIds.includes(service.id))
          .map((service) => service.name),
      } as TicketResult;
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message || "Failed to issue ticket"
        : "Failed to issue ticket";

      setErrorMessage(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    location,
    queues,
    services,
    email,
    setEmail,
    selectedQueueId,
    setSelectedQueueId,
    selectedServiceIds,
    loading,
    errorMessage,
    toggleService,
    issueTicket,
  };
};

export default usePublicTabletIssueTicket;
