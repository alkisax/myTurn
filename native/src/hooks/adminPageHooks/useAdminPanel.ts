import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "@/constants/constants";
import { api, getAuthHeaders } from "@/hooks/companySetupHooks/api";
import type {
  AdminCompany,
  AdminDesk,
  AdminLocation,
  AdminQueue,
  AdminService,
  AdminStaffMember,
  CompanyOverview,
  CompletionStats,
  LocationAnalytics,
  QueueAnalytics,
  StaffAnalytics,
} from "@/types/adminPanel.types";

export type AdminPanelKey =
  | "overview"
  | "organizations"
  | "locations"
  | "queues"
  | "services"
  | "desks"
  | "staff"
  | "analytics";

export interface AdminAnalytics {
  overview: CompanyOverview | null;
  queues: QueueAnalytics[];
  locations: LocationAnalytics[];
  staff: StaffAnalytics[];
  completion: CompletionStats | null;
}

const messageFor = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    return typeof message === "string" ? message : fallback;
  }
  return fallback;
};

const useAdminPanel = () => {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [queues, setQueues] = useState<AdminQueue[]>([]);
  const [services, setServices] = useState<AdminService[]>([]);
  const [desks, setDesks] = useState<AdminDesk[]>([]);
  const [staff, setStaff] = useState<AdminStaffMember[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [selectedQueueId, setSelectedQueueId] = useState<number | null>(null);
  const [analytics, setAnalytics] = useState<AdminAnalytics>({
    overview: null,
    queues: [],
    locations: [],
    staff: [],
    completion: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const request = useCallback(
    async <T,>(
      method: "get" | "post" | "put" | "delete",
      url: string,
      data?: unknown,
    ) => {
      const config = await getAuthHeaders();
      type ApiEnvelope = { data: T };

      if (method === "get") {
        return (await api.get<ApiEnvelope>(url, config)).data.data;
      }

      if (method === "post") {
        return (await api.post<ApiEnvelope>(url, data, config)).data.data;
      }

      if (method === "put") {
        return (await api.put<ApiEnvelope>(url, data, config)).data.data;
      }

      return (await api.delete<ApiEnvelope>(url, config)).data.data;
    },
    [],
  );

  const loadCompanies = useCallback(async () => {
    const data = await request<AdminCompany[]>("get", `${backendUrl}/companies/mine`);
    setCompanies(data);
    setSelectedCompanyId((current) => current ?? data[0]?.id ?? null);
  }, [request]);

  const loadLocations = useCallback(async () => {
    if (selectedCompanyId === null) return;
    const data = await request<AdminLocation[]>(
      "get",
      `${backendUrl}/locations/company/${selectedCompanyId}`,
    );
    setLocations(data);
  }, [request, selectedCompanyId]);

  const loadStaff = useCallback(async () => {
    if (selectedCompanyId === null) return;
    const data = await request<AdminStaffMember[]>(
      "get",
      `${backendUrl}/company-users/company/${selectedCompanyId}/staff`,
    );
    setStaff(data);
  }, [request, selectedCompanyId]);

  const loadQueues = useCallback(async () => {
    if (selectedLocationId === null) return;
    const data = await request<AdminQueue[]>(
      "get",
      `${backendUrl}/queues/location/${selectedLocationId}`,
    );
    setQueues(data);
  }, [request, selectedLocationId]);

  const loadServices = useCallback(async () => {
    if (selectedLocationId === null || selectedQueueId === null) return;
    const data = await request<AdminService[]>(
      "get",
      `${backendUrl}/services/location/${selectedLocationId}`,
    );
    setServices(data.filter((service) => service.queueId === selectedQueueId));
  }, [request, selectedLocationId, selectedQueueId]);

  const loadDesks = useCallback(async () => {
    if (selectedLocationId === null || selectedQueueId === null) return;
    const data = await request<AdminDesk[]>(
      "get",
      `${backendUrl}/desks/location/${selectedLocationId}`,
    );
    setDesks(data.filter((desk) => desk.queueId === selectedQueueId));
  }, [request, selectedLocationId, selectedQueueId]);

  const loadAnalytics = useCallback(async () => {
    if (selectedCompanyId === null) return;
    const base = `${backendUrl}/analytics/company/${selectedCompanyId}`;
    const [overview, queuesData, locationsData, staffData, completion] = await Promise.all([
      request<CompanyOverview>("get", `${base}/overview`),
      request<QueueAnalytics[]>("get", `${base}/tickets-by-queue`),
      request<LocationAnalytics[]>("get", `${base}/tickets-by-location`),
      request<StaffAnalytics[]>("get", `${base}/tickets-by-staff`),
      request<CompletionStats>("get", `${base}/completion-stats`),
    ]);
    setAnalytics({
      overview,
      queues: queuesData,
      locations: locationsData,
      staff: staffData,
      completion,
    });
  }, [request, selectedCompanyId]);

  useEffect(() => {
    setLoading(true);
    void loadCompanies()
      .catch((reason) => {
        setError(messageFor(reason, "Failed to load organizations"));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [loadCompanies]);

  useEffect(() => {
    setSelectedLocationId(null);
    setSelectedQueueId(null);
    setQueues([]);
    setServices([]);
    setDesks([]);
    setError("");
    if (selectedCompanyId === null) return;
    void Promise.all([loadLocations(), loadStaff()]).catch((reason) => {
      setError(messageFor(reason, "Failed to load organization data"));
    });
  }, [loadLocations, loadStaff, selectedCompanyId]);

  useEffect(() => {
    setSelectedQueueId(null);
    setServices([]);
    setDesks([]);
    if (selectedLocationId !== null) {
      void loadQueues().catch((reason) => {
        setError(messageFor(reason, "Failed to load queues"));
      });
    }
  }, [loadQueues, selectedLocationId]);

  useEffect(() => {
    if (selectedLocationId !== null && selectedQueueId !== null) {
      void Promise.all([loadServices(), loadDesks()]).catch((reason) => {
        setError(messageFor(reason, "Failed to load queue data"));
      });
    }
  }, [loadDesks, loadServices, selectedLocationId, selectedQueueId]);

  const refreshAll = async () => {
    if (selectedCompanyId === null) return;
    await loadCompanies();
    await Promise.all([loadLocations(), loadStaff()]);
  };

  const saveCompany = async (id: number | null, body: unknown) => {
    await request(id ? "put" : "post", id ? `${backendUrl}/companies/${id}` : `${backendUrl}/companies/`, body);
    await refreshAll();
  };

  const deleteCompany = async (id: number) => {
    await request("delete", `${backendUrl}/companies/${id}`);
    await loadCompanies();
  };

  const saveLocation = async (id: number | null, body: unknown) => {
    await request(id ? "put" : "post", id ? `${backendUrl}/locations/${id}` : `${backendUrl}/locations/`, body);
    await loadLocations();
  };

  const deleteLocation = async (id: number) => {
    await request("delete", `${backendUrl}/locations/${id}`);
    await loadLocations();
  };

  const saveQueue = async (id: number | null, body: unknown) => {
    await request(id ? "put" : "post", id ? `${backendUrl}/queues/${id}` : `${backendUrl}/queues/`, body);
    await loadQueues();
  };

  const deleteQueue = async (id: number) => {
    await request("delete", `${backendUrl}/queues/${id}`);
    await loadQueues();
  };

  const resetQueue = async (id: number) => {
    await request("post", `${backendUrl}/queues/${id}/reset`, {});
    await loadQueues();
  };

  const saveService = async (id: number | null, body: unknown) => {
    await request(id ? "put" : "post", id ? `${backendUrl}/services/${id}` : `${backendUrl}/services/`, body);
    await loadServices();
  };

  const deleteService = async (id: number) => {
    await request("delete", `${backendUrl}/services/${id}`);
    await loadServices();
  };

  const saveDesk = async (id: number | null, body: unknown) => {
    await request(id ? "put" : "post", id ? `${backendUrl}/desks/${id}` : `${backendUrl}/desks/`, body);
    await loadDesks();
  };

  const deleteDesk = async (id: number) => {
    await request("delete", `${backendUrl}/desks/${id}`);
    await loadDesks();
  };

  const createStaff = async (body: unknown) => {
    if (selectedCompanyId === null) return;
    await request("post", `${backendUrl}/company-users/company/${selectedCompanyId}/staff`, body);
    await loadStaff();
  };

  const updateStaff = async (id: number, body: unknown) => {
    if (selectedCompanyId === null) return;
    await request(
      "put",
      `${backendUrl}/company-users/company/${selectedCompanyId}/staff/${id}`,
      body,
    );
    await loadStaff();
  };

  const removeStaff = async (id: number) => {
    if (selectedCompanyId === null) return;
    await request("delete", `${backendUrl}/company-users/company/${selectedCompanyId}/staff/${id}`);
    await loadStaff();
  };

  return {
    companies,
    selectedCompanyId,
    setSelectedCompanyId,
    locations,
    selectedLocationId,
    setSelectedLocationId,
    queues,
    selectedQueueId,
    setSelectedQueueId,
    services,
    desks,
    staff,
    analytics,
    loading,
    error,
    setError,
    loadAnalytics,
    saveCompany,
    deleteCompany,
    saveLocation,
    deleteLocation,
    saveQueue,
    deleteQueue,
    resetQueue,
    saveService,
    deleteService,
    saveDesk,
    deleteDesk,
    createStaff,
    updateStaff,
    removeStaff,
  };
};

export default useAdminPanel;
export type AdminPanelApi = ReturnType<typeof useAdminPanel>;
