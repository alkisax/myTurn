import { useEffect, useState } from "react";
import axios from "axios";

import { api } from "@/authLogin/services/api";
import { backendUrl } from "@/constants/constants";
import { getAuthHeaders } from "@/hooks/companySetupHooks/api";
import type {
  PublicLocationSummary,
  PublicService,
  PublicTabletQueue,
} from "@/types/public.types";
import type { Company, StaffDesk, StaffSession } from "@/types/staff.types";
import type { TicketResult } from "@/types/ticket.types";

interface Options {
  session: StaffSession | null;
  selectedCompany: Company | undefined;
  selectedDesk: StaffDesk | null;
}

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

  useEffect(() => {
    if (!session || !selectedCompany || !selectedDesk) {
      return;
    }

    let cancelled = false;

    const loadOptions = async () => {
      try {
        const publicBase = `${backendUrl}/public/${selectedCompany.slug}`;
        const locationResponse = await api.get(`${publicBase}/locations`);
        const activeLocation = (
          locationResponse.data.data as PublicLocationSummary[]
        ).find((item) => item.id === selectedDesk.locationId);

        if (!activeLocation || cancelled) {
          return;
        }

        setLocation(activeLocation);
        const queueResponse = await api.get(
          `${publicBase}/${activeLocation.slug}/queues`,
        );

        if (!cancelled) {
          setQueues(queueResponse.data.data);
        }
      } catch {
        if (!cancelled) {
          setErrorMessage("Failed to load ticket options");
        }
      }
    };

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, [selectedCompany, selectedDesk, session]);

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

    let cancelled = false;

    api
      .get(
        `${backendUrl}/public/${selectedCompany.slug}/${location.slug}/queues/${selectedQueueId}/services`,
      )
      .then((response) => {
        if (!cancelled) {
          setServices(response.data.data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setServices([]);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [location, selectedCompany, selectedQueueId]);

  const toggleService = (serviceId: number) => {
    setSelectedServiceIds((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId],
    );
  };

  const issueTicket = async (): Promise<TicketResult | null> => {
    if (!selectedQueueId) {
      setErrorMessage("Please choose a queue");
      return null;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const config = await getAuthHeaders();
      const response = await api.post(
        `${backendUrl}/tickets/kiosk`,
        {
          queueId: selectedQueueId,
          email: email || null,
          serviceIds: selectedServiceIds,
        },
        config,
      );

      return {
        ticket: response.data.data,
        queueName:
          queues.find((queue) => queue.id === selectedQueueId)?.name ?? "",
        serviceNames: services
          .filter((service) => selectedServiceIds.includes(service.id))
          .map((service) => service.name),
      };
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
