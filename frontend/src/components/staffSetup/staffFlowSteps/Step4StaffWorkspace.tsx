// frontend/src/components/staffSetup/staffFlowSteps/Step4StaffWorkspace.tsx

import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { backendUrl } from "../../../constants/constants";
import type {
  StaffDesk,
  StaffSession,
  Ticket,
} from "../../../context/StaffContextDefinition";

interface Props {
  desk: StaffDesk;
  session: StaffSession;

  waitingTickets: Ticket[];
  servingTickets: Ticket[];
  missedTickets: Ticket[];
  waitingCount: number;
  servingCount: number;
  missedCount: number;
  totalTickets: number;
  nextWaitingTicket: Ticket | undefined;
  currentTicket: Ticket | null;

  loading: boolean;
  errorMessage: string;

  onNext: () => void;
  onComplete: () => void;
  onMissed: () => void;
  onRecall: (ticketId: number) => void;
  onToggleBreak: () => void;
  onEndShift: () => void;
}

interface TicketIdentification {
  number: number;
  queueName: string;
  status: string;
  services: Array<{ id: number; name: string }>;
}

const Step4StaffWorkspace = ({
  desk,
  session,
  waitingTickets,
  servingTickets,
  missedTickets,
  waitingCount,
  servingCount,
  missedCount,
  totalTickets,
  nextWaitingTicket,
  currentTicket,
  loading,
  errorMessage,
  onNext,
  onComplete,
  onMissed,
  onRecall,
  onToggleBreak,
  onEndShift,
}: Props) => {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [identification, setIdentification] = useState<TicketIdentification | null>(null);
  const [identifying, setIdentifying] = useState(false);
  const [identificationMessage, setIdentificationMessage] = useState("");
  const isBreak = session.status === "BREAK";

  const identifyTicket = async () => {
    setIdentification(null);
    setIdentificationMessage("");
    setIdentifying(true);

    try {
      const response = await axios.get(
        `${backendUrl}/tickets/identify-by-pin/${encodeURIComponent(pin)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setIdentification(response.data.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setIdentificationMessage("Ticket not found");
      } else {
        setIdentificationMessage("Failed to search for ticket");
      }
    } finally {
      setIdentifying(false);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 700,
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Typography variant="h5">
        Step 4 — Staff Workspace
      </Typography>

      {/* WORKPLACE */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">
          {desk.name}
        </Typography>

        <Typography>
          Location: {desk.locationName}
        </Typography>

        <Typography>
          Queue: {desk.queueName}
        </Typography>

        <Typography
          sx={{
            mt: 1,
            fontWeight: 700,
          }}
        >
          Status: {session.status}
        </Typography>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Search Ticket by PIN</Typography>
        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <TextField
            size="small"
            label="PIN"
            value={pin}
            onChange={(event) => setPin(event.target.value)}
            slotProps={{
              htmlInput: { maxLength: 4, inputMode: "numeric" },
            }}
          />
          <Button
            variant="contained"
            disabled={identifying || pin.length === 0}
            onClick={() => void identifyTicket()}
          >
            {identifying ? "Searching..." : "Search"}
          </Button>
        </Box>

        {identificationMessage && (
          <Typography color="error" sx={{ mt: 1 }}>
            {identificationMessage}
          </Typography>
        )}

        {identification && (
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ fontWeight: 700 }}>
              Ticket #{identification.number}
            </Typography>
            <Typography>Queue: {identification.queueName}</Typography>
            <Typography>Status: {identification.status}</Typography>
            <Typography>
              Services: {identification.services.map((service) => service.name).join(", ") || "None selected"}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* COUNTS */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Paper sx={{ p: 2, flex: 1, minWidth: 130 }}>
          <Typography color="text.secondary">
            Waiting
          </Typography>

          <Typography variant="h4">
            {waitingCount}
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, flex: 1, minWidth: 130 }}>
          <Typography color="text.secondary">
            Serving
          </Typography>

          <Typography variant="h4">
            {servingCount}
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, flex: 1, minWidth: 130 }}>
          <Typography color="text.secondary">
            Missed
          </Typography>

          <Typography variant="h4">
            {missedCount}
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, flex: 1, minWidth: 130 }}>
          <Typography color="text.secondary">
            Total
          </Typography>

          <Typography variant="h4">
            {totalTickets}
          </Typography>
        </Paper>
      </Box>

      {errorMessage && (
        <Typography color="error">
          {errorMessage}
        </Typography>
      )}

      {/* CURRENT TICKET */}
      {currentTicket && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6">
            Current Customer
          </Typography>

          <Typography
            variant="h3"
            sx={{ my: 2 }}
          >
            #{currentTicket.number}
          </Typography>

          {currentTicket.services.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontWeight: 700 }}>
                Services
              </Typography>

              {currentTicket.services.map((service) => (
                <Typography key={service.id}>
                  {service.name}
                </Typography>
              ))}
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              gap: 2,
            }}
          >
            <Button
              variant="contained"
              disabled={loading || isBreak}
              onClick={onComplete}
            >
              Complete
            </Button>

            <Button
              variant="outlined"
              disabled={loading || isBreak}
              onClick={onMissed}
            >
              Missed
            </Button>
          </Box>
        </Paper>
      )}

      {/* NEXT CUSTOMER */}
      {!currentTicket && !isBreak && (
        <Button
          variant="contained"
          size="large"
          disabled={loading || !nextWaitingTicket}
          onClick={onNext}
        >
          {nextWaitingTicket
            ? `Next Customer — #${nextWaitingTicket.number}`
            : "No Waiting Customers"}
        </Button>
      )}

      {/* WAITING */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">
          Waiting
        </Typography>

        {waitingTickets.length === 0 && (
          <Typography color="text.secondary">
            No customers are waiting.
          </Typography>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            mt: 2,
          }}
        >
          {waitingTickets.map((ticket) => (
            <Box
              key={ticket.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Typography sx={{ fontWeight: 700 }}>
                #{ticket.number}
              </Typography>

              <Typography color="text.secondary">
                {ticket.services
                  .map((service) => service.name)
                  .join(", ") || "No service selected"}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* SERVING */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">
          Currently Serving
        </Typography>

        {servingTickets.length === 0 && (
          <Typography color="text.secondary">
            No ticket is currently being served.
          </Typography>
        )}

        {servingTickets.map((ticket) => (
          <Box
            key={ticket.id}
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Typography sx={{ fontWeight: 700 }}>
              #{ticket.number}
            </Typography>

            <Typography color="text.secondary">
              {ticket.services
                .map((service) => service.name)
                .join(", ") || "No service selected"}
            </Typography>
          </Box>
        ))}
      </Paper>

      {/* MISSED */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">
          Missed Tickets
        </Typography>

        {missedTickets.length === 0 && (
          <Typography color="text.secondary">
            No missed tickets.
          </Typography>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mt: 2,
          }}
        >
          {missedTickets.map((ticket) => (
            <Box
              key={ticket.id}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 700 }}>
                  #{ticket.number}
                </Typography>

                <Typography color="text.secondary">
                  {ticket.services
                    .map((service) => service.name)
                    .join(", ") || "No service selected"}
                </Typography>
              </Box>

              <Button
                variant="outlined"
                disabled={loading || isBreak || currentTicket !== null}
                onClick={() => onRecall(ticket.id)}
              >
                Recall
              </Button>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* SESSION ACTIONS */}
      {!currentTicket && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            disabled={loading}
            onClick={onToggleBreak}
          >
            {isBreak
              ? "Return to Work"
              : "Take Break"}
          </Button>

          <Button
            variant="outlined"
            color="error"
            disabled={loading}
            onClick={onEndShift}
          >
            End Shift
          </Button>
        </Box>
      )}

      <Button
        variant="outlined"
        onClick={() => navigate("/staff/public-tablet")}
      >
        Set this screen as a public tablet / kiosk
      </Button>

      <Button
        variant="outlined"
        onClick={() => navigate("/staff/number-display")}
      >
        Set this screen as number display
      </Button>
    </Box>
  );
};

export default Step4StaffWorkspace;
