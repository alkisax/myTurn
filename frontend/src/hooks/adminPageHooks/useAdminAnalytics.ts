import { useEffect, useState } from "react";
import axios from "axios";
import { backendUrl } from "../../constants/constants";
import type {
  CompanyOverview,
  CompletionStats,
  LocationAnalytics,
  QueueAnalytics,
  StaffAnalytics,
} from "../../types/analytics.types";

interface AnalyticsState {
  overview: CompanyOverview | null;
  queues: QueueAnalytics[];
  locations: LocationAnalytics[];
  staff: StaffAnalytics[];
  completion: CompletionStats | null;
}
const emptyState: AnalyticsState = {
  overview: null,
  queues: [],
  locations: [],
  staff: [],
  completion: null,
};
const authConfig = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});
const getErrorMessage = (error: unknown) =>
  axios.isAxiosError(error)
    ? error.response?.data?.message || "Failed to load analytics"
    : "Failed to load analytics";

const useAdminAnalytics = (selectedCompanyId: number | null) => {
  const [data, setData] = useState<AnalyticsState>(emptyState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let ignore = false;
    Promise.resolve().then(() => {
      if (!ignore) {
        setData(emptyState);
        setError("");
      }
    });
    if (selectedCompanyId === null)
      return () => {
        ignore = true;
      };
    const base = `${backendUrl}/analytics/company/${selectedCompanyId}`;
    Promise.resolve()
      .then(() => {
        if (!ignore) setLoading(true);
        return Promise.all([
          axios.get(`${base}/overview`, authConfig()),
          axios.get(`${base}/tickets-by-queue`, authConfig()),
          axios.get(`${base}/tickets-by-location`, authConfig()),
          axios.get(`${base}/tickets-by-staff`, authConfig()),
          axios.get(`${base}/completion-stats`, authConfig()),
        ]);
      })
      .then(([overview, queues, locations, staff, completion]) => {
        if (!ignore)
          setData({
            overview: overview.data.data,
            queues: queues.data.data,
            locations: locations.data.data,
            staff: staff.data.data,
            completion: completion.data.data,
          });
      })
      .catch((reason: unknown) => {
        if (!ignore) setError(getErrorMessage(reason));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [selectedCompanyId]);
  return { ...data, loading, error };
};
export default useAdminAnalytics;
// Hook που φορτώνει τα analytics δεδομένα που εμφανίζει το AdminAnalyticsPanel.
