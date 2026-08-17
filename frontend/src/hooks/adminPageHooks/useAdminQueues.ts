import { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../../constants/constants";

interface AdminLocation {
  id: number;
  name: string;
}
export interface AdminQueue {
  id: number;
  locationId: number;
  name: string;
  description: string | null;
  isActive: boolean;
  isRemoteTicketingAllowed: boolean;
  defaultServiceMinutes: number | null;
  maxWaitingTickets: number | null;
  opensAt: string | null;
  closesAt: string | null;
  resetNumberDaily: boolean;
  autoResetEnabled: boolean;
  resetAt: string | null;
}
export interface QueueFormValues {
  name: string;
  description: string;
  defaultServiceMinutes: string;
  maxWaitingTickets: string;
  opensAt: string;
  closesAt: string;
  autoResetEnabled: boolean;
  resetAt: string;
  isActive: boolean;
  isRemoteTicketingAllowed: boolean;
  resetNumberDaily: boolean;
}
const emptyForm: QueueFormValues = {
  name: "",
  description: "",
  defaultServiceMinutes: "",
  maxWaitingTickets: "",
  opensAt: "",
  closesAt: "",
  autoResetEnabled: false,
  resetAt: "",
  isActive: true,
  isRemoteTicketingAllowed: true,
  resetNumberDaily: false,
};
const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});
const getErrorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError(error)
    ? error.response?.data?.message || fallback
    : fallback;

const useAdminQueues = (selectedCompanyId: number | null) => {
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(
    null,
  );
  const [queues, setQueues] = useState<AdminQueue[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQueue, setEditingQueue] = useState<AdminQueue | null>(null);
  const [form, setForm] = useState<QueueFormValues>(emptyForm);

  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) {
        setSelectedLocationId(null);
        setQueues([]);
      }
    });
    if (selectedCompanyId === null) {
      return () => {
        ignore = true;
      };
    }
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
      .catch((error: unknown) => {
        if (!ignore)
          setErrorMessage(getErrorMessage(error, "Failed to load locations"));
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
    if (selectedLocationId === null) {
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
          `${backendUrl}/queues/location/${selectedLocationId}`,
          authConfig(),
        );
      })
      .then((response) => {
        if (!ignore) setQueues(response.data.data);
      })
      .catch((error: unknown) => {
        if (!ignore)
          setErrorMessage(getErrorMessage(error, "Failed to load queues"));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [selectedLocationId]);

  const refreshQueues = async () => {
    if (selectedLocationId === null) return;
    const response = await axios.get(
      `${backendUrl}/queues/location/${selectedLocationId}`,
      authConfig(),
    );
    setQueues(response.data.data);
  };
  const openCreate = () => {
    setEditingQueue(null);
    setForm(emptyForm);
    setErrorMessage("");
    setDialogOpen(true);
  };
  const openEdit = (queue: AdminQueue) => {
    setEditingQueue(queue);
    setForm({
      name: queue.name,
      description: queue.description ?? "",
      defaultServiceMinutes: queue.defaultServiceMinutes?.toString() ?? "",
      maxWaitingTickets: queue.maxWaitingTickets?.toString() ?? "",
      opensAt: queue.opensAt ?? "",
      closesAt: queue.closesAt ?? "",
      autoResetEnabled: queue.autoResetEnabled,
      resetAt: queue.resetAt ?? "",
      isActive: queue.isActive,
      isRemoteTicketingAllowed: queue.isRemoteTicketingAllowed,
      resetNumberDaily: queue.resetNumberDaily,
    });
    setErrorMessage("");
    setDialogOpen(true);
  };
  const updateForm = (field: keyof QueueFormValues, value: string | boolean) =>
    setForm((current) => ({ ...current, [field]: value }));
  const closeDialog = () => {
    if (!saving) setDialogOpen(false);
  };
  const saveQueue = async () => {
    if (selectedLocationId === null || !form.name.trim()) {
      setErrorMessage("Queue name is required");
      return;
    }
    const optionalNumber = (value: string) => (value ? Number(value) : null);
    const defaultServiceMinutes = optionalNumber(form.defaultServiceMinutes);
    const maxWaitingTickets = optionalNumber(form.maxWaitingTickets);
    if (
      [defaultServiceMinutes, maxWaitingTickets].some(
        (value) => value !== null && (!Number.isInteger(value) || value < 1),
      )
    ) {
      setErrorMessage("Numeric values must be whole numbers greater than zero");
      return;
    }
    setSaving(true);
    setErrorMessage("");
    try {
      const common = {
        name: form.name.trim(),
        description: form.description || null,
        defaultServiceMinutes,
        maxWaitingTickets,
        opensAt: form.opensAt || null,
        closesAt: form.closesAt || null,
        autoResetEnabled: form.autoResetEnabled,
        resetAt: form.resetAt || null,
      };
      if (editingQueue)
        await axios.put(
          `${backendUrl}/queues/${editingQueue.id}`,
          {
            ...common,
            isActive: form.isActive,
            isRemoteTicketingAllowed: form.isRemoteTicketingAllowed,
            resetNumberDaily: form.resetNumberDaily,
          },
          authConfig(),
        );
      else
        await axios.post(
          `${backendUrl}/queues/`,
          { ...common, locationId: selectedLocationId },
          authConfig(),
        );
      await refreshQueues();
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingQueue(null);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, "Failed to save queue"));
    } finally {
      setSaving(false);
    }
  };
  const deleteQueue = async (queue: AdminQueue) => {
    if (!window.confirm(`Delete queue "${queue.name}"?`)) return;
    try {
      await axios.delete(`${backendUrl}/queues/${queue.id}`, authConfig());
      await refreshQueues();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, "Failed to delete queue"));
    }
  };
  const resetQueue = async (queue: AdminQueue) => {
    if (!window.confirm(`Reset queue "${queue.name}"?`)) return;
    try {
      await axios.post(
        `${backendUrl}/queues/${queue.id}/reset`,
        {},
        authConfig(),
      );
      await refreshQueues();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, "Failed to reset queue"));
    }
  };
  return {
    locations,
    selectedLocationId,
    setSelectedLocationId,
    queues,
    loading,
    locationsLoading,
    saving,
    errorMessage,
    dialogOpen,
    editingQueue,
    form,
    openCreate,
    openEdit,
    closeDialog,
    updateForm,
    saveQueue,
    deleteQueue,
    resetQueue,
  };
};
export default useAdminQueues;
// Hook που φορτώνει queues και χειρίζεται create, edit, delete και reset για το AdminQueuesPanel.
