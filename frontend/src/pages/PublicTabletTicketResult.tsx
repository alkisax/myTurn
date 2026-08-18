import { useEffect, useState, type ReactNode } from "react";
import type { TicketResult } from "../types/ticket.types";
import { Box, Button, Paper, Typography } from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import { useStaffContext } from "../context/useStaffContext";
import usePublicTabletTicketResult from "../hooks/publicPageHooks/usePublicTabletTicketResult";

const ticketStorageKey = "myturn-public-tablet-ticket";

const PublicTabletTicketResult = () => {
  const navigate = useNavigate();
  const { session } = useStaffContext();
  const [restoredResult, setRestoredResult] = useState<TicketResult | null>(
    null,
  );
  const { trackingData, secondsRemaining, countdownFinished } =
    usePublicTabletTicketResult(restoredResult);

  useEffect(() => {
    const storedResult = sessionStorage.getItem(ticketStorageKey);
    Promise.resolve().then(() => {
      if (storedResult)
        setRestoredResult(JSON.parse(storedResult) as TicketResult);
    });
  }, []);
  useEffect(() => {
    if (!countdownFinished) return;
    sessionStorage.removeItem(ticketStorageKey);
    navigate("/staff/public-tablet", { replace: true });
  }, [countdownFinished, navigate]);
  const displayResult = trackingData;
  if (!session || !displayResult) {
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
  const result = displayResult;

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
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: 3,
          }}
        >
          <QRCodeSVG
            value={`${window.location.origin}/track/${result.ticket.trackingToken}`}
            size={180}
          />
        </Box>
        {typeof result.ticket.estimatedWaitingMinutes === "number" && (
          <>
            <Typography variant="h6" sx={{ mt: 3 }}>
              Estimated Waiting Time
            </Typography>
            <Typography>
              {result.ticket.estimatedWaitingMinutes.toFixed(1)} minutes
            </Typography>
          </>
        )}
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
