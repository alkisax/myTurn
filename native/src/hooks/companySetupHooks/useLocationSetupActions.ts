import { useCallback, useEffect, useState } from "react";
import { backendUrl } from "@/constants/constants";
import type {
  DeskSummary,
  LocationSummary,
  QueueSummary,
  ServiceSummary,
} from "@/types/companySetup.types";
import { api, getAuthHeaders } from "./api";

const useLocationSetupActions = (location: LocationSummary) => {
  const [queues, setQueues] = useState<QueueSummary[]>([]);
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [desks, setDesks] = useState<DeskSummary[]>([]);

  const fetchQueues = useCallback(async () => {
    try {
      const response = await api.get(
        `${backendUrl}/queues/location/${location.id}`,
        await getAuthHeaders(),
      );
      setQueues(response.data.data);
    } catch (error) {
      console.error("Failed to fetch queues:", error);
    }
  }, [location.id]);

  const fetchServices = useCallback(async () => {
    try {
      const response = await api.get(
        `${backendUrl}/services/location/${location.id}`,
        await getAuthHeaders(),
      );
      setServices(response.data.data);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    }
  }, [location.id]);

  const fetchDesks = useCallback(async () => {
    try {
      const response = await api.get(
        `${backendUrl}/desks/location/${location.id}`,
        await getAuthHeaders(),
      );
      setDesks(response.data.data);
    } catch (error) {
      console.error("Failed to fetch desks:", error);
    }
  }, [location.id]);

  useEffect(() => {
    void fetchQueues();
    void fetchServices();
    void fetchDesks();
  }, [fetchDesks, fetchQueues, fetchServices]);

  return {
    queues,
    services,
    desks,
    fetchQueues,
    fetchServices,
    fetchDesks,
  };
};

export default useLocationSetupActions;
