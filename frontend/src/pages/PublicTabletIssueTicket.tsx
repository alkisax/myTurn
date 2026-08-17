import { type ReactNode } from "react";
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
import { useStaffContext } from "../context/useStaffContext";
import usePublicTabletIssueTicket from "../hooks/publicPageHooks/usePublicTabletIssueTicket";

const PublicTabletIssueTicket = () => {
  const navigate = useNavigate();
  const { session, selectedCompany, selectedDesk } = useStaffContext();
  const {
    location,
    queues,
    services,
    email,
    setEmail,
    selectedQueueId,
    setSelectedQueueId,
    selectedServiceIds,
    loading,
    errorMessage,
    toggleService,
    issueTicket,
  } = usePublicTabletIssueTicket({ session, selectedCompany, selectedDesk });

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
              variant={selectedQueueId === queue.id ? "contained" : "outlined"}
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
        onClick={() =>
          void issueTicket().then((result) => {
            if (result) {
              sessionStorage.setItem(
                "myturn-public-tablet-ticket",
                JSON.stringify(result),
              );
              navigate("/staff/public-tablet/ticket");
            }
          })
        }
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
