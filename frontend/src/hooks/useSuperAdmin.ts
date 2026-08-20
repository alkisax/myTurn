import { useCallback, useEffect, useState } from "react";
import axios from "axios";

import { backendUrl } from "../constants/constants";

export interface SuperAdminCompanyLink {
  id: number;
  name: string;
  slug: string;
  membershipCreatedAt: string;
  adminCount: number;
}

export interface SuperAdminAdmin {
  id: number;
  username: string;
  name: string | null;
  email: string | null;
  role: "ADMIN";
  createdAt: string;
  updatedAt: string;
  companies: SuperAdminCompanyLink[];
}

export interface SuperAdminCompanyUser {
  id: number;
  username: string;
  name: string | null;
  email: string | null;
}

export interface SuperAdminCompany {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  admins: SuperAdminCompanyUser[];
  staffCount: number;
  locationCount: number;
  queueCount: number;
  deskCount: number;
  serviceCount: number;
  ticketCount: number;
  hasNoAdmin: boolean;
  hasMultipleAdmins: boolean;
  hasNoStaff: boolean;
  hasNoLocations: boolean;
  hasNoActiveQueues: boolean;
}

export interface SuperAdminStats {
  companies: number;
  adminUsers: number;
  staffUsers: number;
  locations: number;
  queues: number;
  desks: number;
  services: number;
  tickets: number;
  staffSessions: number;
  companiesWithoutAdmin: number;
  companiesWithMultipleAdmins: number;
  companiesWithoutStaff: number;
  companiesWithoutLocations: number;
  companiesWithoutActiveQueues: number;
}

interface ApiResponse<T> {
  data: T;
}

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

const getErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  const status = error.response?.status;
  const backendMessage = error.response?.data?.message;

  if (backendMessage) {
    return backendMessage;
  }

  if (status === 401 || status === 403) {
    return "You are not authorized to access the SuperAdmin Panel.";
  }

  return fallback;
};

const useSuperAdmin = () => {
  const [admins, setAdmins] = useState<SuperAdminAdmin[]>([]);
  const [companies, setCompanies] = useState<SuperAdminCompany[]>([]);
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingAdminId, setDeletingAdminId] = useState<number | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [adminsResponse, companiesResponse, statsResponse] =
        await Promise.all([
          axios.get<ApiResponse<SuperAdminAdmin[]>>(
            `${backendUrl}/superadmin/admins`,
            authConfig(),
          ),
          axios.get<ApiResponse<SuperAdminCompany[]>>(
            `${backendUrl}/superadmin/companies`,
            authConfig(),
          ),
          axios.get<ApiResponse<SuperAdminStats>>(
            `${backendUrl}/superadmin/stats`,
            authConfig(),
          ),
        ]);

      setAdmins(adminsResponse.data.data);
      setCompanies(companiesResponse.data.data);
      setStats(statsResponse.data.data);
    } catch (requestError: unknown) {
      setError(
        getErrorMessage(requestError, "Failed to load SuperAdmin data."),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    Promise.all([
      axios.get<ApiResponse<SuperAdminAdmin[]>>(
        `${backendUrl}/superadmin/admins`,
        authConfig(),
      ),
      axios.get<ApiResponse<SuperAdminCompany[]>>(
        `${backendUrl}/superadmin/companies`,
        authConfig(),
      ),
      axios.get<ApiResponse<SuperAdminStats>>(
        `${backendUrl}/superadmin/stats`,
        authConfig(),
      ),
    ])
      .then(([adminsResponse, companiesResponse, statsResponse]) => {
        if (!ignore) {
          setAdmins(adminsResponse.data.data);
          setCompanies(companiesResponse.data.data);
          setStats(statsResponse.data.data);
        }
      })
      .catch((requestError: unknown) => {
        if (!ignore) {
          setError(
            getErrorMessage(requestError, "Failed to load SuperAdmin data."),
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

  const deleteAdmin = async (adminId: number) => {
    setDeletingAdminId(adminId);
    setError("");

    try {
      await axios.delete(`${backendUrl}/superadmin/admins/${adminId}`, authConfig());
      await loadAll();
    } catch (requestError: unknown) {
      if (axios.isAxiosError(requestError)) {
        const status = requestError.response?.status;

        if (status === 409) {
          throw new Error(
            "This ADMIN cannot be deleted because one or more Companies are also associated with another ADMIN.",
            { cause: requestError },
          );
        }

        if (status === 400) {
          throw new Error("Only ADMIN accounts can be deleted here.", {
            cause: requestError,
          });
        }

        if (status === 401 || status === 403) {
          throw new Error("You are not authorized to delete this ADMIN.", {
            cause: requestError,
          });
        }

        if (status === 404) {
          throw new Error("The ADMIN account could not be found.", {
            cause: requestError,
          });
        }
      }

      throw new Error("The ADMIN account could not be deleted.", {
        cause: requestError,
      });
    } finally {
      setDeletingAdminId(null);
    }
  };

  return {
    admins,
    companies,
    stats,
    loading,
    error,
    deletingAdminId,
    loadAll,
    deleteAdmin,
  };
};

export default useSuperAdmin;
