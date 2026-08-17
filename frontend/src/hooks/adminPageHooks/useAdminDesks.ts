import { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../../constants/constants";

export interface AdminDesk {
  id: number;
  companyId: number;
  locationId: number;
  queueId: number;
  name: string;
  isActive: boolean;
}
interface AdminLocation {
  id: number;
  name: string;
}
interface AdminQueue {
  id: number;
  name: string;
}
export interface DeskFormValues {
  name: string;
  queueId: number | null;
  isActive: boolean;
}
const emptyForm: DeskFormValues = { name: "", queueId: null, isActive: true };
const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});
const getErrorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError(error)
    ? error.response?.data?.message || fallback
    : fallback;

const useAdminDesks = (selectedCompanyId: number | null) => {
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(
    null,
  );
  const [queues, setQueues] = useState<AdminQueue[]>([]);
  const [selectedQueueId, setSelectedQueueId] = useState<number | null>(null);
  const [desks, setDesks] = useState<AdminDesk[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const [queuesLoading, setQueuesLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDesk, setEditingDesk] = useState<AdminDesk | null>(null);
  const [form, setForm] = useState<DeskFormValues>(emptyForm);

  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) {
        setSelectedLocationId(null);
        setSelectedQueueId(null);
        setQueues([]);
        setDesks([]);
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
        if (!ignore)
          setError(getErrorMessage(reason, "Failed to load locations"));
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
        setDesks([]);
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
        if (!ignore) setError(getErrorMessage(reason, "Failed to load queues"));
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
    if (selectedQueueId === null || selectedLocationId === null) {
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
          `${backendUrl}/desks/location/${selectedLocationId}`,
          authConfig(),
        );
      })
      .then((response) => {
        if (!ignore)
          setDesks(
            (response.data.data as AdminDesk[]).filter(
              (desk) => desk.queueId === selectedQueueId,
            ),
          );
      })
      .catch((reason: unknown) => {
        if (!ignore) setError(getErrorMessage(reason, "Failed to load desks"));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [selectedLocationId, selectedQueueId]);

  const refresh = async () => {
    if (selectedLocationId === null || selectedQueueId === null) return;
    const response = await axios.get(
      `${backendUrl}/desks/location/${selectedLocationId}`,
      authConfig(),
    );
    setDesks(
      (response.data.data as AdminDesk[]).filter(
        (desk) => desk.queueId === selectedQueueId,
      ),
    );
  };
  const openCreate = () => {
    setEditingDesk(null);
    setForm({ ...emptyForm, queueId: selectedQueueId });
    setError("");
    setDialogOpen(true);
  };
  const openEdit = (desk: AdminDesk) => {
    setEditingDesk(desk);
    setForm({
      name: desk.name,
      queueId: desk.queueId,
      isActive: desk.isActive,
    });
    setError("");
    setDialogOpen(true);
  };
  const updateForm = (
    field: keyof DeskFormValues,
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
    setSaving(true);
    setError("");
    try {
      if (editingDesk)
        await axios.put(
          `${backendUrl}/desks/${editingDesk.id}`,
          {
            name: form.name.trim(),
            isActive: form.isActive,
            queueId: form.queueId,
          },
          authConfig(),
        );
      else
        await axios.post(
          `${backendUrl}/desks/`,
          {
            locationId: selectedLocationId,
            queueId: form.queueId,
            name: form.name.trim(),
          },
          authConfig(),
        );
      await refresh();
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingDesk(null);
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Failed to save desk"));
    } finally {
      setSaving(false);
    }
  };
  const remove = async (desk: AdminDesk) => {
    if (!window.confirm(`Delete desk "${desk.name}"?`)) return;
    try {
      await axios.delete(`${backendUrl}/desks/${desk.id}`, authConfig());
      await refresh();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Failed to delete desk"));
    }
  };
  return {
    locations,
    selectedLocationId,
    setSelectedLocationId,
    queues,
    selectedQueueId,
    setSelectedQueueId,
    desks,
    locationsLoading,
    queuesLoading,
    loading,
    error,
    saving,
    dialogOpen,
    editingDesk,
    form,
    openCreate,
    openEdit,
    closeDialog,
    updateForm,
    save,
    remove,
  };
};
export default useAdminDesks;
// Hook που φορτώνει locations, queues και desks για το AdminDesksPanel.
