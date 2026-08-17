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
import usePublicRemoteTicket from "../hooks/publicPageHooks/usePublicRemoteTicket";

const PublicRemoteTicket = () => {
  const { companySlug, locationSlug, queueId } = useParams<{
    companySlug: string;
    locationSlug: string;
    queueId: string;
  }>();
  const navigate = useNavigate();
  const {
    company,
    location,
    queue,
    services,
    selectedServiceIds,
    email,
    setEmail,
    loading,
    submitting,
    loadErrorMessage,
    submitErrorMessage,
    toggleService,
    submitTicket,
  } = usePublicRemoteTicket(companySlug, locationSlug, queueId);

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
          onClick={() => {
            void submitTicket().then((trackingToken) => {
              if (trackingToken) navigate(`/tickets/${trackingToken}`);
            });
          }}
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
