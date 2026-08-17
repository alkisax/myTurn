import { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../../constants/constants";
import type { LocationOption } from "../../types/location.types";
import type { QueueOption } from "../../types/queue.types";
import type { AdminService } from "../../types/adminPanel.types";

export interface ServiceFormValues {
  name: string;
  description: string;
  estimatedServiceMinutes: string;
  isGeneric: boolean;
  isActive: boolean;
  queueId: number | null;
}
const emptyForm: ServiceFormValues = {
  name: "",
  description: "",
  estimatedServiceMinutes: "",
  isGeneric: false,
  isActive: true,
  queueId: null,
};
const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});
const errorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError(error)
    ? error.response?.data?.message || fallback
    : fallback;

const useAdminServices = (selectedCompanyId: number | null) => {
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(
    null,
  );
  const [queues, setQueues] = useState<QueueOption[]>([]);
  const [selectedQueueId, setSelectedQueueId] = useState<number | null>(null);
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [queuesLoading, setQueuesLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<AdminService | null>(
    null,
  );
  const [form, setForm] = useState<ServiceFormValues>(emptyForm);

  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) {
        setSelectedLocationId(null);
        setSelectedQueueId(null);
        setQueues([]);
        setServices([]);
      }
    });
    if (selectedCompanyId === null)
      return () => {
        ignore = true;
      };
    Promise.resolve()
      .then(() => {
        if (!ignore) setLocationsLoading(true);
        return axios.get(
          `${backendUrl}/locations/company/${selectedCompanyId}`,
          authConfig(),
        );
      })
      .then((response) => {
        if (!ignore) setLocations(response.data.data);
      })
      .catch((reason: unknown) => {
        if (!ignore) setError(errorMessage(reason, "Failed to load locations"));
      })
      .finally(() => {
        if (!ignore) setLocationsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [selectedCompanyId]);

  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) {
        setSelectedQueueId(null);
        setServices([]);
      }
    });
    if (selectedLocationId === null)
      return () => {
        ignore = true;
      };
    Promise.resolve()
      .then(() => {
        if (!ignore) setQueuesLoading(true);
        return axios.get(
          `${backendUrl}/queues/location/${selectedLocationId}`,
          authConfig(),
        );
      })
      .then((response) => {
        if (!ignore) setQueues(response.data.data);
      })
      .catch((reason: unknown) => {
        if (!ignore) setError(errorMessage(reason, "Failed to load queues"));
      })
      .finally(() => {
        if (!ignore) setQueuesLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [selectedLocationId]);

  useEffect(() => {
    let ignore = false;
    if (selectedQueueId === null) {
      Promise.resolve().then(() => {
        if (!ignore) setLoading(false);
      });
      return () => {
        ignore = true;
      };
    }
    Promise.resolve()
      .then(() => {
        if (!ignore) setLoading(true);
        return axios.get(
          `${backendUrl}/services/location/${selectedLocationId}`,
          authConfig(),
        );
      })
      .then((response) => {
        if (!ignore)
          setServices(
            (response.data.data as AdminService[]).filter(
              (service) => service.queueId === selectedQueueId,
            ),
          );
      })
      .catch((reason: unknown) => {
        if (!ignore) setError(errorMessage(reason, "Failed to load services"));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [selectedQueueId, selectedLocationId]);

  const refresh = async () => {
    if (selectedQueueId === null || selectedLocationId === null) return;
    const response = await axios.get(
      `${backendUrl}/services/location/${selectedLocationId}`,
      authConfig(),
    );
    setServices(
      (response.data.data as AdminService[]).filter(
        (service) => service.queueId === selectedQueueId,
      ),
    );
  };
  const openCreate = () => {
    setEditingService(null);
    setForm({ ...emptyForm, queueId: selectedQueueId });
    setError("");
    setDialogOpen(true);
  };
  const openEdit = (service: AdminService) => {
    setEditingService(service);
    setForm({
      name: service.name,
      description: service.description ?? "",
      estimatedServiceMinutes:
        service.estimatedServiceMinutes?.toString() ?? "",
      isGeneric: service.isGeneric,
      isActive: service.isActive,
      queueId: service.queueId,
    });
    setError("");
    setDialogOpen(true);
  };
  const updateForm = (
    field: keyof ServiceFormValues,
    value: string | boolean | number | null,
  ) => setForm((current) => ({ ...current, [field]: value }));
  const closeDialog = () => {
    if (!saving) setDialogOpen(false);
  };
  const save = async () => {
    if (
      !form.name.trim() ||
      form.queueId === null ||
      selectedLocationId === null
    ) {
      setError("Name, location and queue are required");
      return;
    }
    const minutes = form.estimatedServiceMinutes
      ? Number(form.estimatedServiceMinutes)
      : null;
    if (minutes !== null && (!Number.isInteger(minutes) || minutes < 1)) {
      setError(
        "Estimated service minutes must be a whole number greater than zero",
      );
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editingService)
        await axios.put(
          `${backendUrl}/services/${editingService.id}`,
          {
            queueId: form.queueId,
            name: form.name.trim(),
            description: form.description || null,
            estimatedServiceMinutes: minutes,
            isGeneric: form.isGeneric,
            isActive: form.isActive,
          },
          authConfig(),
        );
      else
        await axios.post(
          `${backendUrl}/services/`,
          {
            locationId: selectedLocationId,
            queueId: form.queueId,
            name: form.name.trim(),
            description: form.description || null,
            estimatedServiceMinutes: minutes,
            isGeneric: form.isGeneric,
          },
          authConfig(),
        );
      await refresh();
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingService(null);
    } catch (reason: unknown) {
      setError(errorMessage(reason, "Failed to save service"));
    } finally {
      setSaving(false);
    }
  };
  const remove = async (service: AdminService) => {
    if (!window.confirm(`Delete service "${service.name}"?`)) return;
    try {
      await axios.delete(`${backendUrl}/services/${service.id}`, authConfig());
      await refresh();
    } catch (reason: unknown) {
      setError(errorMessage(reason, "Failed to delete service"));
    }
  };
  return {
    locations,
    selectedLocationId,
    setSelectedLocationId,
    queues,
    selectedQueueId,
    setSelectedQueueId,
    services,
    loading,
    locationsLoading,
    queuesLoading,
    error,
    saving,
    dialogOpen,
    editingService,
    form,
    openCreate,
    openEdit,
    closeDialog,
    updateForm,
    save,
    remove,
  };
};
export default useAdminServices;
// Hook που φορτώνει και διαχειρίζεται services για το AdminServicesPanel.
