import { useEffect, useState } from "react";
import type { PublicCompany, PublicLocationDetails, PublicQueue, PublicService } from "../types/public.types";
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
import { useNavigate, useParams } from "react-router-dom";
import { backendUrl } from "../constants/constants";

type PublicCompanyData = PublicCompany;
type PublicLocationData = PublicLocationDetails;

const PublicRemoteTicket = () => {
  const { companySlug, locationSlug, queueId } = useParams<{
    companySlug: string;
    locationSlug: string;
    queueId: string;
  }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<PublicCompanyData | null>(null);
  const [location, setLocation] = useState<PublicLocationData | null>(null);
  const [queue, setQueue] = useState<PublicQueue | null>(null);
  const [services, setServices] = useState<PublicService[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadErrorMessage, setLoadErrorMessage] = useState("");
  const [submitErrorMessage, setSubmitErrorMessage] = useState("");

  useEffect(() => {
    if (!companySlug || !locationSlug || !queueId) {
      return;
    }

    let ignore = false;
    const publicBase = `${backendUrl}/public/${companySlug}`;
    const locationBase = `${publicBase}/${locationSlug}`;

    Promise.all([
      axios.get(publicBase),
      axios.get(locationBase),
      axios.get(`${locationBase}/queues`),
      axios.get(`${locationBase}/queues/${queueId}/services`),
    ])
      .then(([companyResponse, locationResponse, queuesResponse, servicesResponse]) => {
        if (ignore) {
          return;
        }

        const selectedQueue = (queuesResponse.data.data as PublicQueue[]).find(
          (item) => item.id === Number(queueId)
        );

        setCompany(companyResponse.data.data);
        setLocation(locationResponse.data.data);
        setQueue(selectedQueue ?? null);
        setServices(servicesResponse.data.data);

        if (!selectedQueue || !selectedQueue.isRemoteTicketingAllowed) {
          setLoadErrorMessage("This queue is not available for remote ticketing");
        }
      })
      .catch((error: unknown) => {
        if (!ignore) {
          setLoadErrorMessage(
            axios.isAxiosError(error) && error.response?.status === 404
              ? "Company, location, or queue not found"
              : "Unable to load ticket options"
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
  }, [companySlug, locationSlug, queueId]);

  const toggleService = (serviceId: number) => {
    setSelectedServiceIds((current) =>
      current.includes(serviceId)
        ? current.filter((id) => id !== serviceId)
        : [...current, serviceId]
    );
  };

  const submitTicket = async () => {
    if (!queue || !companySlug || !locationSlug) {
      return;
    }

    setSubmitting(true);
    setSubmitErrorMessage("");

    try {
      const response = await axios.post(`${backendUrl}/tickets`, {
        queueId: queue.id,
        email: email || null,
        serviceIds: selectedServiceIds,
      });
      const trackingToken = response.data.data.trackingToken;
      navigate(`/tickets/${trackingToken}`);
    } catch (error: unknown) {
      setSubmitErrorMessage(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Unable to create ticket"
          : "Unable to create ticket"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>Loading ticket options...</Typography>
      </Box>
    );
  }

  if (!company || !location || !queue || loadErrorMessage) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5">
          {loadErrorMessage || "Queue not available"}
        </Typography>
        <Button
          sx={{ mt: 2 }}
          variant="outlined"
          onClick={() => navigate(`/${companySlug}/${locationSlug}`)}
        >
          Back to queues
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 3, sm: 6 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      <Typography variant="h4">{company.name}</Typography>
      <Typography variant="h5">{location.name}</Typography>
      <Paper sx={{ p: 3, width: "100%", maxWidth: 640 }}>
        <Typography variant="h5">{queue.name}</Typography>
        {queue.description && (
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {queue.description}
          </Typography>
        )}

        <Typography variant="h6" sx={{ mt: 3 }}>
          Get a Ticket
        </Typography>

        <TextField
          fullWidth
          label="Email (optional)"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          sx={{ mt: 2 }}
        />

        <Typography variant="h6" sx={{ mt: 3 }}>
          Services (optional)
        </Typography>
        {services.length > 0 ? (
          services.map((service) => (
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
          ))
        ) : (
          <Typography color="text.secondary">
            No service selection is required.
          </Typography>
        )}

        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 3 }}
          disabled={submitting}
          onClick={() => void submitTicket()}
        >
          {submitting ? "Getting Ticket..." : "Get Ticket"}
        </Button>
        {submitErrorMessage && (
          <Typography color="error" sx={{ mt: 2 }}>
            {submitErrorMessage}
          </Typography>
        )}
      </Paper>

      <Button
        variant="outlined"
        onClick={() => navigate(`/${companySlug}/${locationSlug}`)}
      >
        Back to queues
      </Button>
    </Box>
  );
};

export default PublicRemoteTicket;
