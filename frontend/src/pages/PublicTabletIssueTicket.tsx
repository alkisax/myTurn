import { useEffect, useState, type ReactNode } from "react";
import type { PublicLocationSummary, PublicService, PublicTabletQueue } from "../types/public.types";
import axios from "axios";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "../constants/constants";
import { useStaffContext } from "../context/useStaffContext";

type PublicLocation = PublicLocationSummary;
type PublicQueue = PublicTabletQueue;

const PublicTabletIssueTicket = () => {
  const navigate = useNavigate();
  const { session, selectedCompany, selectedDesk } = useStaffContext();
  const [location, setLocation] = useState<PublicLocation | null>(null);
  const [queues, setQueues] = useState<PublicQueue[]>([]);
  const [services, setServices] = useState<PublicService[]>([]);
  const [email, setEmail] = useState("");
  const [selectedQueueId, setSelectedQueueId] = useState<number | null>(null);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!session || !selectedCompany || !selectedDesk) {
      return;
    }

    let ignore = false;
    const publicBase = `${backendUrl}/public/${selectedCompany.slug}`;

    axios
      .get(`${publicBase}/locations`)
      .then((locationResponse) => {
        const locations: PublicLocation[] = locationResponse.data.data;
        const activeLocation = locations.find(
          (item) => item.id === selectedDesk.locationId
        );

        if (!activeLocation || ignore) {
          return;
        }

        setLocation(activeLocation);

        return Promise.all([
          axios.get(`${publicBase}/${activeLocation.slug}/queues`),
        ]).then(([queueResponse]) => {
          if (ignore) {
            return;
          }

          setQueues(queueResponse.data.data);
        });
      })
      .catch((error: unknown) => {
        if (!ignore) {
          console.error("Failed to load public ticket options:", error);
          setErrorMessage("Failed to load ticket options");
        }
      });

    return () => {
      ignore = true;
    };
  }, [selectedCompany, selectedDesk, session]);

  useEffect(() => {
    Promise.resolve().then(() => setSelectedServiceIds([]));

    if (!selectedQueueId || !location || !selectedCompany) {
      Promise.resolve().then(() => setServices([]));
      return;
    }

    let ignore = false;
    axios
      .get(
        `${backendUrl}/public/${selectedCompany.slug}/${location.slug}/queues/${selectedQueueId}/services`
      )
      .then((response) => {
        if (!ignore) {
          setServices(response.data.data);
        }
      })
      .catch((error: unknown) => {
        if (!ignore) {
          console.error("Failed to load queue services:", error);
          setServices([]);
        }
      });

    return () => {
      ignore = true;
    };
  }, [location, selectedCompany, selectedQueueId]);

  const toggleService = (serviceId: number) => {
    setSelectedServiceIds((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId]
    );
  };

  const issueTicket = async () => {
    if (!selectedQueueId) {
      setErrorMessage("Please choose a queue");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post(
        `${backendUrl}/tickets/kiosk`,
        {
          queueId: selectedQueueId,
          email: email || null,
          serviceIds: selectedServiceIds,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // console.log("Kiosk ticket response:", response.data);
      // console.log("Ticket data:", response.data.data);

      const queue = queues.find((item) => item.id === selectedQueueId);
      const selectedServices = services.filter((service) =>
        selectedServiceIds.includes(service.id)
      );

      sessionStorage.setItem(
        "myturn-public-tablet-ticket",
        JSON.stringify({
          ticket: response.data.data,
          queueName: queue?.name ?? "",
          serviceNames: selectedServices.map((service) => service.name),
        })
      );

      navigate("/staff/public-tablet/ticket");
    } catch (error: unknown) {
      setErrorMessage(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to issue ticket"
          : "Failed to issue ticket"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <TabletLayout>
        <Typography variant="h4">Public tablet unavailable</Typography>
        <Typography>
          This public tablet requires an active staff session.
        </Typography>
        <Button variant="contained" onClick={() => navigate("/staff")}>
          Back to Staff Workspace
        </Button>
      </TabletLayout>
    );
  }

  return (
    <TabletLayout>
      <Typography variant="h4">Issue a Ticket</Typography>
      <TextField
        fullWidth
        label="Email (optional)"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        sx={{ maxWidth: 520 }}
      />

      <Paper sx={{ p: 3, width: "100%", maxWidth: 520 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Choose Queue
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {queues.map((queue) => (
            <Button
              key={queue.id}
              variant={
                selectedQueueId === queue.id ? "contained" : "outlined"
              }
              disabled={!queue.isActive}
              onClick={() => setSelectedQueueId(queue.id)}
            >
              {queue.name}
            </Button>
          ))}
        </Box>
      </Paper>

      {selectedQueueId && (
        <Paper sx={{ p: 3, width: "100%", maxWidth: 520 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Services (optional)
          </Typography>
          {services.map((service) => (
            <FormControlLabel
              key={service.id}
              control={
                <Checkbox
                  checked={selectedServiceIds.includes(service.id)}
                  onChange={() => toggleService(service.id)}
                />
              }
              label={service.name}
            />
          ))}
        </Paper>
      )}

      {location && (
        <Typography color="text.secondary">{location.name}</Typography>
      )}
      {errorMessage && <Typography color="error">{errorMessage}</Typography>}
      <Button
        variant="contained"
        size="large"
        disabled={loading || !selectedQueueId}
        onClick={() => void issueTicket()}
      >
        {loading ? "Issuing..." : "Issue Ticket"}
      </Button>
      <Button variant="text" onClick={() => navigate("/staff/public-tablet")}>
        Back to Kiosk Home
      </Button>
    </TabletLayout>
  );
};

const TabletLayout = ({ children }: { children: ReactNode }) => (
  <Box
    sx={{
      minHeight: "100vh",
      p: { xs: 3, sm: 6 },
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
    }}
  >
    {children}
  </Box>
);

export default PublicTabletIssueTicket;
