import { useEffect, useState, type ReactNode } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { Box, Button, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "../constants/constants";
import { useStaffContext } from "../context/useStaffContext";

interface NowServingEvent {
  number: number;
  deskId: number;
  queueId: number;
}

const PublicTablet = () => {
  const navigate = useNavigate();
  const { session, selectedCompany, selectedDesk, desks } = useStaffContext();
  const [servingNumber, setServingNumber] = useState<number | null>(null);
  const [servingDeskId, setServingDeskId] = useState<number | null>(null);

  useEffect(() => {
    if (!session) {
      return;
    }

    const connection = new HubConnectionBuilder()
      .withUrl(`${backendUrl}/queue-hub`)
      .configureLogging(LogLevel.Warning)
      .withAutomaticReconnect()
      .build();

    const handleNowServingChanged = (event: NowServingEvent) => {
      if (event.queueId !== session.queueId) {
        return;
      }

      setServingNumber(event.number);
      setServingDeskId(event.deskId);
    };

    connection.on("NowServingChanged", handleNowServingChanged);

    const connect = async () => {
      try {
        await connection.start();
        await connection.invoke("JoinQueue", session.queueId);
      } catch (error) {
        console.error("Failed to connect public tablet to queue:", error);
      }
    };

    void connect();

    return () => {
      connection.off("NowServingChanged", handleNowServingChanged);

      const disconnect = async () => {
        try {
          if (connection.state === "Connected") {
            await connection.invoke("LeaveQueue", session.queueId);
          }
        } finally {
          await connection.stop();
        }
      };

      void disconnect();
    };
  }, [session]);

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

  const servingDesk = desks.find((desk) => desk.id === servingDeskId);
  const deskName = servingDesk?.name;

  return (
    <TabletLayout>
      <Typography variant="h3">MyTurn</Typography>
      <Typography variant="h5">NOW SERVING</Typography>

      <Paper sx={{ p: 4, textAlign: "center", width: "100%", maxWidth: 520 }}>
        {servingNumber === null ? (
          <Typography variant="h5">
            Waiting for the next customer call
          </Typography>
        ) : (
          <>
            <Typography variant="h1" sx={{ fontWeight: 700 }}>
              #{servingNumber}
            </Typography>
            <Typography variant="h5">Please go to</Typography>
            <Typography variant="h4">
              {deskName ?? "the service desk"}
            </Typography>
          </>
        )}

        <Typography color="text.secondary" sx={{ mt: 2 }}>
          {selectedCompany?.name} · {selectedDesk?.queueName}
        </Typography>
      </Paper>

      <Button
        variant="contained"
        size="large"
        onClick={() => navigate("/staff/public-tablet/issue")}
      >
        Issue a Ticket
      </Button>

      <Button variant="text" onClick={() => navigate("/staff")}>
        Exit Public Tablet
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
      textAlign: "center",
    }}
  >
    {children}
  </Box>
);

export default PublicTablet;
