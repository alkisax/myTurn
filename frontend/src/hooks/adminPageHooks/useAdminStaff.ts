import { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../../constants/constants";
import type { AdminStaffMember } from "../../types/adminPanel.types";

export interface StaffFormValues {
  username: string;
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}
const emptyForm: StaffFormValues = {
  username: "",
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};
const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});
const getErrorMessage = (error: unknown, fallback: string) =>
  axios.isAxiosError(error)
    ? error.response?.data?.message || fallback
    : fallback;

const useAdminStaff = (selectedCompanyId: number | null) => {
  const [staff, setStaff] = useState<AdminStaffMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<StaffFormValues>(emptyForm);

  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) setStaff([]);
    });
    if (selectedCompanyId === null)
      return () => {
        ignore = true;
      };
    Promise.resolve()
      .then(() => {
        if (!ignore) setLoading(true);
        return axios.get(
          `${backendUrl}/company-users/company/${selectedCompanyId}/staff`,
          authConfig(),
        );
      })
      .then((response) => {
        if (!ignore) setStaff(response.data.data);
      })
      .catch((reason: unknown) => {
        if (!ignore) setError(getErrorMessage(reason, "Failed to load staff"));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [selectedCompanyId]);

  const refresh = async () => {
    if (selectedCompanyId === null) return;
    const response = await axios.get(
      `${backendUrl}/company-users/company/${selectedCompanyId}/staff`,
      authConfig(),
    );
    setStaff(response.data.data);
  };
  const openCreate = () => {
    setForm(emptyForm);
    setError("");
    setDialogOpen(true);
  };
  const closeDialog = () => {
    if (!saving) setDialogOpen(false);
  };
  const updateForm = (field: keyof StaffFormValues, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));
  const save = async () => {
    if (
      selectedCompanyId === null ||
      !form.username.trim() ||
      form.password.length < 6
    ) {
      setError("Username and a password of at least 6 characters are required");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await axios.post(
        `${backendUrl}/company-users/company/${selectedCompanyId}/staff`,
        {
          username: form.username.trim(),
          name: form.name.trim() || null,
          email: form.email.trim() || null,
          password: form.password,
        },
        authConfig(),
      );
      await refresh();
      setDialogOpen(false);
      setForm(emptyForm);
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Failed to create staff member"));
    } finally {
      setSaving(false);
    }
  };
  const remove = async (member: AdminStaffMember) => {
    if (
      selectedCompanyId === null ||
      !window.confirm(
        `Remove ${member.name || member.username} from this organization?`,
      )
    )
      return;
    try {
      await axios.delete(
        `${backendUrl}/company-users/company/${selectedCompanyId}/staff/${member.id}`,
        authConfig(),
      );
      await refresh();
    } catch (reason: unknown) {
      setError(getErrorMessage(reason, "Failed to remove staff member"));
    }
  };
  return {
    staff,
    loading,
    error,
    saving,
    dialogOpen,
    form,
    openCreate,
    closeDialog,
    updateForm,
    save,
    remove,
  };
};
export default useAdminStaff;
// Hook που φορτώνει και διαχειρίζεται organization staff για το AdminStaffPanel.
