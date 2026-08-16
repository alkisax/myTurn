// frontend/src/components/staffSetup/staffFlowSteps/Step4StaffWorkspace.tsx

import {
  Box,
  Button,
  Paper,
  Typography,
} from "@mui/material";

interface StaffDesk {
  id: number;
  name: string;
  locationId: number;
  locationName: string;
  queueId: number;
  queueName: string;
  isActive: boolean;
}

interface StaffSession {
  id: number;
  status: string;
}

interface TicketService {
  id: number;
  name: string;
}

interface Ticket {
  id: number;
  number: number;
  status: string;
  services: TicketService[];
}

interface Props {
  desk: StaffDesk;
  session: StaffSession;

  tickets: Ticket[];
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

const Step4StaffWorkspace = ({
  desk,
  session,
  tickets,
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
  const isBreak = session.status === "BREAK";

  const waitingTickets = tickets.filter(
    (ticket) => ticket.status === "WAITING"
  );

  const servingTickets = tickets.filter(
    (ticket) => ticket.status === "SERVING"
  );

  const missedTickets = tickets.filter(
    (ticket) => ticket.status === "MISSED"
  );

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
            {waitingTickets.length}
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, flex: 1, minWidth: 130 }}>
          <Typography color="text.secondary">
            Serving
          </Typography>

          <Typography variant="h4">
            {servingTickets.length}
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, flex: 1, minWidth: 130 }}>
          <Typography color="text.secondary">
            Missed
          </Typography>

          <Typography variant="h4">
            {missedTickets.length}
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, flex: 1, minWidth: 130 }}>
          <Typography color="text.secondary">
            Total
          </Typography>

          <Typography variant="h4">
            {tickets.length}
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
          disabled={loading || waitingTickets.length === 0}
          onClick={onNext}
        >
          {waitingTickets.length > 0
            ? `Next Customer — #${waitingTickets[0].number}`
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
    </Box>
  );
};

export default Step4StaffWorkspace;