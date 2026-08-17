import { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../../constants/constants";
import type { AdminCompany } from "../../types/adminPanel.types";

export interface CompanyFormValues {
  name: string;
  missedTicketExpiryMinutes: string;
  defaultEstimatedServiceMinutes: string;
}

const emptyForm: CompanyFormValues = {
  name: "",
  missedTicketExpiryMinutes: "10",
  defaultEstimatedServiceMinutes: "5",
};

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const getErrorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError(error)
    ? error.response?.data?.message || fallback
    : fallback;

const useAdminCompanies = () => {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<AdminCompany | null>(
    null,
  );
  const [infoCompany, setInfoCompany] = useState<AdminCompany | null>(null);
  const [copyMessage, setCopyMessage] = useState("");
  const [form, setForm] = useState<CompanyFormValues>(emptyForm);

  const refreshCompanies = async () => {
    const response = await axios.get(
      `${backendUrl}/companies/mine`,
      authConfig(),
    );
    setCompanies(response.data.data);
  };

  useEffect(() => {
    let ignore = false;

    axios
      .get(`${backendUrl}/companies/mine`, authConfig())
      .then((response) => {
        if (!ignore) {
          setCompanies(response.data.data);
        }
      })
      .catch((error: unknown) => {
        if (!ignore) {
          setErrorMessage(
            getErrorMessage(error, "Failed to load organizations"),
          );
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
  }, []);

  const openCreate = () => {
    setEditingCompany(null);
    setForm(emptyForm);
    setErrorMessage("");
    setDialogOpen(true);
  };

  const openEdit = (company: AdminCompany) => {
    setEditingCompany(company);
    setForm({
      name: company.name,
      missedTicketExpiryMinutes: String(company.missedTicketExpiryMinutes),
      defaultEstimatedServiceMinutes: String(
        company.defaultEstimatedServiceMinutes,
      ),
    });
    setErrorMessage("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (!saving) {
      setDialogOpen(false);
    }
  };

  const openInfo = (company: AdminCompany) => {
    setInfoCompany(company);
    setCopyMessage("");
  };

  const closeInfo = () => {
    setInfoCompany(null);
    setCopyMessage("");
  };

  const copyPublicLink = async () => {
    if (!infoCompany) {
      return;
    }

    const publicUrl = `${window.location.origin}/${infoCompany.slug}`;
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopyMessage("Public link copied");
    } catch {
      setCopyMessage("Could not copy the public link");
    }
  };

  const updateForm = (field: keyof CompanyFormValues, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const saveCompany = async () => {
    if (!form.name.trim()) {
      setErrorMessage("Organization name is required");
      return;
    }

    const missedTicketExpiryMinutes = Number(form.missedTicketExpiryMinutes);
    const defaultEstimatedServiceMinutes = Number(
      form.defaultEstimatedServiceMinutes,
    );
    if (
      !Number.isInteger(missedTicketExpiryMinutes) ||
      missedTicketExpiryMinutes < 1 ||
      !Number.isInteger(defaultEstimatedServiceMinutes) ||
      defaultEstimatedServiceMinutes < 1
    ) {
      setErrorMessage("Durations must be whole numbers greater than zero");
      return;
    }

    setSaving(true);
    setErrorMessage("");

    try {
      const body = {
        name: form.name.trim(),
        missedTicketExpiryMinutes,
        defaultEstimatedServiceMinutes,
      };
      if (editingCompany) {
        await axios.put(
          `${backendUrl}/companies/${editingCompany.id}`,
          body,
          authConfig(),
        );
      } else {
        await axios.post(`${backendUrl}/companies/`, body, authConfig());
      }
      await refreshCompanies();
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingCompany(null);
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, "Failed to save organization"));
    } finally {
      setSaving(false);
    }
  };

  const deleteCompany = async (company: AdminCompany) => {
    if (!window.confirm(`Delete organization "${company.name}"?`)) {
      return;
    }

    setErrorMessage("");
    try {
      await axios.delete(`${backendUrl}/companies/${company.id}`, authConfig());
      await refreshCompanies();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, "Failed to delete organization"));
    }
  };

  return {
    companies,
    loading,
    saving,
    errorMessage,
    dialogOpen,
    editingCompany,
    infoCompany,
    copyMessage,
    form,
    openCreate,
    openEdit,
    closeDialog,
    openInfo,
    closeInfo,
    copyPublicLink,
    updateForm,
    saveCompany,
    deleteCompany,
  };
};

export default useAdminCompanies;
// Hook που διαχειρίζεται φόρτωση και CRUD ενεργειών για το AdminCompaniesPanel.
