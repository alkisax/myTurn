import { useEffect, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";
import { backendUrl } from "../constants/constants";

interface TicketInfoData {
  number: number;
  pin: string;
  status: string;
  services?: Array<{ name: string }>;
  estimatedWaitingMinutes: number;
  peopleAhead: number;
  nowServing: Array<{
    deskId: number;
    deskName: string;
    number: number;
  }>;
}

const TicketInfo = () => {
  const { trackingToken } = useParams<{ trackingToken: string }>();
  const [ticket, setTicket] = useState<TicketInfoData | null>(null);

  useEffect(() => {
    if (!trackingToken) {
      return;
    }

    let ignore = false;

    axios
      .get(`${backendUrl}/tickets/${trackingToken}`)
      .then((response) => {
        if (!ignore) {
          setTicket(response.data.data);
        }
      })
      .catch((error: unknown) => {
        if (!ignore) {
          console.error("Failed to load ticket information:", error);
        }
      });

    return () => {
      ignore = true;
    };
  }, [trackingToken]);

  if (!ticket) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5">Loading ticket information...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 3, sm: 6 }, display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 4, width: "100%", maxWidth: 520 }}>
        <Typography variant="h3" sx={{ textAlign: "center" }}>
          #{ticket.number}
        </Typography>
        <Typography sx={{ mt: 2 }}>PIN: {ticket.pin}</Typography>
        <Typography>Status: {ticket.status}</Typography>
        <Typography>
          Services: {ticket.services?.map((service) => service.name).join(", ") || "None selected"}
        </Typography>
        <Typography>
          Estimated waiting time: {ticket.estimatedWaitingMinutes.toFixed(1)} minutes
        </Typography>
        <Typography>Tickets ahead: {ticket.peopleAhead}</Typography>
        <Typography sx={{ mt: 2 }}>Now serving</Typography>
        {ticket.nowServing.length > 0 ? (
          ticket.nowServing.map((entry) => (
            <Typography key={entry.deskId}>
              {entry.deskName} → {entry.number}
            </Typography>
          ))
        ) : (
          <Typography>Nobody</Typography>
        )}
      </Paper>
    </Box>
  );
};

export default TicketInfo;
