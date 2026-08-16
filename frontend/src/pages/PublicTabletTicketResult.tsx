import { useEffect, useState, type ReactNode } from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useStaffContext } from "../context/useStaffContext";

interface TicketResult {
  ticket: {
    number: number;
    pin: string;
    status: string;
  };
  queueName: string;
  serviceNames: string[];
}

const ticketStorageKey = "myturn-public-tablet-ticket";

const PublicTabletTicketResult = () => {
  const navigate = useNavigate();
  const { session } = useStaffContext();
  const [result, setResult] = useState<TicketResult | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  useEffect(() => {
    const storedResult = sessionStorage.getItem(ticketStorageKey);

    Promise.resolve(storedResult).then((storedValue) => {
      if (storedValue) {
        setResult(JSON.parse(storedValue) as TicketResult);
      }
    });

    const intervalId = window.setInterval(() => {
      setSecondsRemaining((seconds) => seconds - 1);
    }, 1000);
    const timeoutId = window.setTimeout(() => {
      sessionStorage.removeItem(ticketStorageKey);
      navigate("/staff/public-tablet", { replace: true });
    }, 60000);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(timeoutId);
    };
  }, [navigate]);

  if (!session || !result) {
    return (
      <TabletLayout>
        <Typography variant="h4">Ticket result unavailable</Typography>
        <Button
          variant="contained"
          onClick={() => navigate("/staff/public-tablet", { replace: true })}
        >
          Back to Kiosk Home
        </Button>
      </TabletLayout>
    );
  }

  return (
    <TabletLayout>
      <Typography variant="h4">Your Ticket</Typography>
      <Paper sx={{ p: 4, width: "100%", maxWidth: 520, textAlign: "center" }}>
        <Typography variant="h1" sx={{ fontWeight: 700 }}>
          #{result.ticket.number}
        </Typography>
        <Typography variant="h5" sx={{ mt: 2 }}>
          PIN {result.ticket.pin}
        </Typography>
        <Typography variant="h6" sx={{ mt: 3 }}>
          Queue
        </Typography>
        <Typography>{result.queueName}</Typography>
        <Typography variant="h6" sx={{ mt: 3 }}>
          Services
        </Typography>
        <Typography>
          {result.serviceNames.length > 0
            ? result.serviceNames.join(", ")
            : "None selected"}
        </Typography>
        <Typography variant="h6" sx={{ mt: 3 }}>
          Status
        </Typography>
        <Typography>{result.ticket.status}</Typography>
      </Paper>
      <Typography>
        Returning to kiosk home in {secondsRemaining} seconds
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={() => {
          sessionStorage.removeItem(ticketStorageKey);
          navigate("/staff/public-tablet", { replace: true });
        }}
      >
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

export default PublicTabletTicketResult;
