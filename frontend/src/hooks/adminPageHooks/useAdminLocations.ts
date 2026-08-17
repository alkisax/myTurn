import { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../../constants/constants";
import type { AdminLocation } from "../../types/adminPanel.types";

export interface LocationFormValues {
  name: string;
  address: string;
  country: string;
  latitude: string;
  longitude: string;
  timeZoneId: string;
  isActive: boolean;
}

const emptyForm: LocationFormValues = {
  name: "",
  address: "",
  country: "",
  latitude: "",
  longitude: "",
  timeZoneId: "",
  isActive: true,
};

const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const getErrorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError(error)
    ? error.response?.data?.message || fallback
    : fallback;

const useAdminLocations = (selectedCompanyId: number | null) => {
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [loading, setLoading] = useState(selectedCompanyId !== null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<AdminLocation | null>(
    null,
  );
  const [form, setForm] = useState<LocationFormValues>(emptyForm);

  useEffect(() => {
    let ignore = false;

    if (selectedCompanyId === null) {
      Promise.resolve().then(() => {
        if (!ignore) {
          setLocations([]);
          setLoading(false);
          setErrorMessage("");
        }
      });
      return () => {
        ignore = true;
      };
    }

    Promise.resolve()
      .then(() => {
        if (!ignore) {
          setLoading(true);
        }
        return axios.get(
          `${backendUrl}/locations/company/${selectedCompanyId}`,
          authConfig(),
        );
      })
      .then((response) => {
        if (!ignore) {
          setLocations(response.data.data);
        }
      })
      .catch((error: unknown) => {
        if (!ignore) {
          setErrorMessage(getErrorMessage(error, "Failed to load locations"));
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
  }, [selectedCompanyId]);

  const refreshLocations = async () => {
    if (selectedCompanyId === null) return;
    const response = await axios.get(
      `${backendUrl}/locations/company/${selectedCompanyId}`,
      authConfig(),
    );
    setLocations(response.data.data);
  };

  const openCreate = () => {
    setEditingLocation(null);
    setForm(emptyForm);
    setErrorMessage("");
    setDialogOpen(true);
  };

  const openEdit = (location: AdminLocation) => {
    setEditingLocation(location);
    setForm({
      name: location.name,
      address: location.address ?? "",
      country: location.country ?? "",
      latitude: location.latitude === null ? "" : String(location.latitude),
      longitude: location.longitude === null ? "" : String(location.longitude),
      timeZoneId: location.timeZoneId ?? "",
      isActive: location.isActive,
    });
    setErrorMessage("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (!saving) setDialogOpen(false);
  };
  const updateForm = (
    field: keyof LocationFormValues,
    value: string | boolean,
  ) => setForm((current) => ({ ...current, [field]: value }));

  const saveLocation = async () => {
    if (selectedCompanyId === null || !form.name.trim()) {
      setErrorMessage("Location name is required");
      return;
    }

    const latitude = form.latitude ? Number(form.latitude) : null;
    const longitude = form.longitude ? Number(form.longitude) : null;
    if (
      (latitude !== null && Number.isNaN(latitude)) ||
      (longitude !== null && Number.isNaN(longitude))
    ) {
      setErrorMessage("Latitude and longitude must be valid numbers");
      return;
    }

    setSaving(true);
    setErrorMessage("");
    try {
      if (editingLocation) {
        await axios.put(
          `${backendUrl}/locations/${editingLocation.id}`,
          {
            name: form.name.trim(),
            address: form.address || null,
            country: form.country || null,
            latitude,
            longitude,
            timeZoneId: form.timeZoneId || null,
            isActive: form.isActive,
          },
          authConfig(),
        );
      } else {
        await axios.post(
          `${backendUrl}/locations/`,
          {
            companyId: selectedCompanyId,
            name: form.name.trim(),
            address: form.address || null,
            country: form.country || null,
            latitude,
            longitude,
            timeZoneId: form.timeZoneId || null,
          },
          authConfig(),
        );
      }
      await refreshLocations();
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingLocation(null);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, "Failed to save location"));
    } finally {
      setSaving(false);
    }
  };

  const deleteLocation = async (location: AdminLocation) => {
    if (!window.confirm(`Delete location "${location.name}"?`)) return;
    setErrorMessage("");
    try {
      await axios.delete(
        `${backendUrl}/locations/${location.id}`,
        authConfig(),
      );
      await refreshLocations();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, "Failed to delete location"));
    }
  };

  return {
    locations,
    loading,
    saving,
    errorMessage,
    dialogOpen,
    editingLocation,
    form,
    openCreate,
    openEdit,
    closeDialog,
    updateForm,
    saveLocation,
    deleteLocation,
  };
};

export default useAdminLocations;
// Hook που διαχειρίζεται τα locations και τις CRUD ενέργειες του AdminLocationsPanel.
