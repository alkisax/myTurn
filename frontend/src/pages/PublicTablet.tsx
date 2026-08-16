import { useEffect, useState, type ReactNode } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import axios from "axios";
import { Box, Button, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "../constants/constants";
import { useStaffContext } from "../context/useStaffContext";

interface NowServingEvent {
  number: number;
  deskId: number;
  queueId: number;
}

interface PublicNowServing {
  queueId: number;
  queueName: string;
  number: number;
  deskId: number;
  deskName: string;
  servingStartedAt: string | null;
}

interface StoredPublicTabletState {
  date: string;
  queueId: number;
  deskId: number;
  number: number;
}

const publicTabletStorageKey = "myturn:public-tablet:last-called";

const getToday = () => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${today.getFullYear()}-${month}-${day}`;
};

const readStoredPublicTabletState = (): StoredPublicTabletState | null => {
  const storedValue = localStorage.getItem(publicTabletStorageKey);

  if (!storedValue) {
    return null;
  }

  try {
    const storedState = JSON.parse(
      storedValue
    ) as StoredPublicTabletState;

    if (storedState.date !== getToday()) {
      localStorage.removeItem(publicTabletStorageKey);
      return null;
    }

    return storedState;
  } catch {
    localStorage.removeItem(publicTabletStorageKey);
    return null;
  }
};

const saveStoredPublicTabletState = (
  state: Omit<StoredPublicTabletState, "date">
) => {
  localStorage.setItem(
    publicTabletStorageKey,
    JSON.stringify({ date: getToday(), ...state })
  );
};

const PublicTablet = () => {
  const navigate = useNavigate();
  const { session, selectedCompany, selectedDesk, desks } = useStaffContext();
  const [servingNumber, setServingNumber] = useState<number | null>(null);
  const [servingDeskId, setServingDeskId] = useState<number | null>(null);

  useEffect(() => {
    if (!session || !selectedCompany) {
      return;
    }

    let ignore = false;
    const publicBase = `${backendUrl}/public/${selectedCompany.slug}`;

    axios
      .get(`${publicBase}/locations`)
      .then((response) => {
        const locations: Array<{ id: number; slug: string }> =
          response.data.data;
        const location = locations.find(
          (item) => item.id === session.locationId
        );

        if (!location || ignore) {
          return;
        }

        return axios
          .get(`${publicBase}/${location.slug}/now-serving`)
          .then((snapshotResponse) => {
            if (ignore) {
              return;
            }

            const snapshot: PublicNowServing[] = snapshotResponse.data.data;
            const current = snapshot.find(
              (item) => item.deskId === session.deskId
            );
            const stored = readStoredPublicTabletState();
            const storedForSession =
              stored?.deskId === session.deskId &&
              stored.queueId === session.queueId
                ? stored
                : null;
            const displayState = current ?? storedForSession;

            setServingNumber(displayState?.number ?? null);
            setServingDeskId(displayState?.deskId ?? null);

            if (current) {
              saveStoredPublicTabletState({
                queueId: current.queueId,
                deskId: current.deskId,
                number: current.number,
              });
            }
          });
      })
      .catch((error: unknown) => {
        if (!ignore) {
          console.error("Failed to load public now serving snapshot:", error);
        }
      });

    return () => {
      ignore = true;
    };
  }, [selectedCompany, session]);

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
      if (
        event.queueId !== session.queueId ||
        event.deskId !== session.deskId
      ) {
        return;
      }

      setServingNumber(event.number);
      setServingDeskId(event.deskId);
      saveStoredPublicTabletState({
        queueId: event.queueId,
        deskId: event.deskId,
        number: event.number,
      });
    };

    connection.on("NowServingChanged", handleNowServingChanged);

    const handleNowServingEnded = (event: NowServingEvent) => {
      if (
        event.queueId !== session.queueId ||
        event.deskId !== session.deskId
      ) {
        return;
      }

      // Keep the last called number visible after service ends.
    };

    connection.on("NowServingEnded", handleNowServingEnded);

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
      connection.off("NowServingEnded", handleNowServingEnded);

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
