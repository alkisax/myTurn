import { useEffect, useMemo, useState } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import axios from "axios";
import { Box, Button, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { backendUrl } from "../constants/constants";
import type { StaffDesk } from "../context/StaffContextDefinition";
import { useStaffContext } from "../context/useStaffContext";

interface PublicLocation {
  id: number;
  name: string;
  slug: string;
}

interface PublicQueue {
  id: number;
  name: string;
  isActive: boolean;
}

interface NowServingEvent {
  number: number;
  deskId: number;
  queueId: number | string;
}

interface QueueDisplayState {
  queueId: number;
  number: number;
  deskId: number;
  deskName?: string;
}

interface PublicNowServing {
  queueId: number;
  queueName: string;
  number: number;
  deskId: number;
  deskName: string;
  servingStartedAt: string | null;
}

interface StoredNumberDisplayState {
  date: string;
  entries: Record<string, QueueDisplayState>;
}

const numberDisplayStorageKey = "myturn:number-display:last-called";

const getToday = () => {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${today.getFullYear()}-${month}-${day}`;
};

const readStoredDisplayState = (): Record<string, QueueDisplayState> => {
  const storedValue = localStorage.getItem(numberDisplayStorageKey);

  if (!storedValue) {
    return {};
  }

  try {
    const storedState = JSON.parse(storedValue) as StoredNumberDisplayState;

    if (storedState.date !== getToday()) {
      localStorage.removeItem(numberDisplayStorageKey);
      return {};
    }

    return storedState.entries;
  } catch {
    localStorage.removeItem(numberDisplayStorageKey);
    return {};
  }
};

const saveStoredDisplayState = (
  entries: Record<string, QueueDisplayState>
) => {
  const storedState: StoredNumberDisplayState = {
    date: getToday(),
    entries,
  };

  localStorage.setItem(numberDisplayStorageKey, JSON.stringify(storedState));
};

const StaffNumberDisplay = () => {
  const navigate = useNavigate();
  const { session, selectedCompany, desks } = useStaffContext();
  const [queues, setQueues] = useState<PublicQueue[]>([]);
  const [queueDisplayState, setQueueDisplayState] = useState<
    Record<number, QueueDisplayState[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session || !selectedCompany) {
      return;
    }

    let ignore = false;
    const publicBase = `${backendUrl}/public/${selectedCompany.slug}`;

    axios
      .get(`${publicBase}/locations`)
      .then((response) => {
        const locations: PublicLocation[] = response.data.data;
        const location = locations.find(
          (item) => item.id === session.locationId
        );

        if (!location || ignore) {
          return;
        }

        return Promise.all([
          axios.get(`${publicBase}/${location.slug}/queues`),
          axios.get(`${publicBase}/${location.slug}/now-serving`),
        ]).then(([queueResponse, snapshotResponse]) => {
            if (ignore) {
              return;
            }

            setQueues(queueResponse.data.data);
            const snapshot: PublicNowServing[] = snapshotResponse.data.data;
            const storedEntries = readStoredDisplayState();
            const initialEntries = { ...storedEntries };

            for (const item of snapshot) {
              initialEntries[`${item.queueId}:${item.deskId}`] = {
                queueId: item.queueId,
                number: item.number,
                deskId: item.deskId,
                deskName: item.deskName,
              };
            }

            const nextState: Record<number, QueueDisplayState[]> = {};

            for (const item of Object.values(initialEntries)) {
              const entries = nextState[item.queueId] ?? [];
              entries.push(item);
              nextState[item.queueId] = entries;
            }

            saveStoredDisplayState(initialEntries);
            setQueueDisplayState(nextState);
          });
      })
      .catch((error: unknown) => {
        if (!ignore) {
          console.error("Failed to load number display queues:", error);
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
  }, [selectedCompany, session]);

  useEffect(() => {
    if (!session || queues.length === 0) {
      return;
    }

    let disposed = false;
    const queueIds = queues.map((queue) => queue.id);
    const displayedQueueIds = new Set(queueIds);
    const connection = new HubConnectionBuilder()
      .withUrl(`${backendUrl}/queue-hub`)
      .configureLogging(LogLevel.Warning)
      .withAutomaticReconnect()
      .build();

    const handleNowServingChanged = (event: NowServingEvent) => {
      const queueId = Number(event.queueId);

      if (!displayedQueueIds.has(queueId)) {
        return;
      }

      const storageKey = `${queueId}:${event.deskId}`;
      const storedEntries = readStoredDisplayState();
      const nextEntry = {
        queueId,
        number: event.number,
        deskId: event.deskId,
      };

      storedEntries[storageKey] = nextEntry;
      saveStoredDisplayState(storedEntries);

      setQueueDisplayState((current) => ({
        ...current,
        [queueId]: [
          ...(current[queueId] ?? []).filter(
            (entry) => entry.deskId !== event.deskId
          ),
          nextEntry,
        ],
      }));
    };

    connection.on("NowServingChanged", handleNowServingChanged);

    const handleNowServingEnded = (event: NowServingEvent) => {
      const queueId = Number(event.queueId);

      if (!displayedQueueIds.has(queueId)) {
        return;
      }

      // The display intentionally keeps the last called number visible.
    };

    connection.on("NowServingEnded", handleNowServingEnded);

    const joinQueues = async () => {
      for (const queueId of queueIds) {
        await connection.invoke("JoinQueue", queueId);
      }
    };

    connection.onreconnected(() => {
      if (!disposed) {
        void joinQueues();
      }
    });

    const connect = async () => {
      try {
        await connection.start();

        if (disposed) {
          return;
        }

        await joinQueues();
      } catch (error) {
        if (!disposed) {
          console.error("Failed to connect number display to queues:", error);
        }
      }
    };

    void connect();

    return () => {
      disposed = true;
      connection.off("NowServingChanged", handleNowServingChanged);
      connection.off("NowServingEnded", handleNowServingEnded);

      const disconnect = async () => {
        try {
          if (connection.state === "Connected") {
            for (const queueId of queueIds) {
              await connection.invoke("LeaveQueue", queueId);
            }
          }
        } finally {
          if (connection.state !== "Disconnected") {
            await connection.stop();
          }
        }
      };

      void disconnect();
    };
  }, [queues, session]);

  const desksById = useMemo(() => {
    const locationDesks = session
      ? desks.filter((desk) => desk.locationId === session.locationId)
      : [];

    return new Map<number, StaffDesk>(
      locationDesks.map((desk) => [desk.id, desk])
    );
  }, [desks, session]);

  if (!session) {
    return (
      <DisplayMessage onBack={() => navigate("/staff")}>
        This display requires an active staff session.
      </DisplayMessage>
    );
  }

  const columnCount = queues.length <= 3 ? queues.length || 1 : 2;

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 4 },
        display: "flex",
        flexDirection: "column",
        gap: 2,
        backgroundColor: "#090a0c",
        color: "#d98282",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography variant="h3" sx={{ color: "#e56f6f" }}>
          MyTurn
        </Typography>
        <Button
          size="small"
          variant="text"
          onClick={() => navigate("/staff")}
          sx={{ color: "#d98282" }}
        >
          Exit Number Display
        </Button>
      </Box>

      {loading && <Typography>Loading queues...</Typography>}

      {!loading && queues.length === 0 && (
        <Typography>No active queues are available at this location.</Typography>
      )}

      <Box
        sx={{
          display: "grid",
          alignItems: "start",
          gridTemplateColumns: {
            xs: "1fr",
            sm: `repeat(${columnCount}, minmax(0, 1fr))`,
          },
          gap: 2,
        }}
      >
        {queues.map((queue) => {
          const currentEntries = queueDisplayState[queue.id] ?? [];

          return (
            <Paper
              key={queue.id}
              sx={{
                p: { xs: 3, sm: 5 },
                aspectRatio: "1 / 1",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: 2,
                backgroundColor: "#17191d",
                color: "#d98282",
                border: "1px solid #3a2024",
                boxShadow: "0 8px 28px rgba(0, 0, 0, 0.35)",
              }}
            >
              <Typography variant="h4" sx={{ color: "#e58a8a" }}>
                {queue.name}
              </Typography>

              {currentEntries.length > 0 ? (
                currentEntries.map((current) => {
                  const desk = desksById.get(current.deskId);

                  return (
                    <Box key={current.deskId}>
                      <Typography
                        variant="h1"
                        sx={{
                          fontFamily: '"DSEG7 Classic", sans-serif',
                          fontWeight: 700,
                          color: "#f06f6f",
                        }}
                      >
                        #{current.number}
                      </Typography>
                      <Typography variant="h6" sx={{ color: "#c96f6f" }}>
                        PLEASE GO TO
                      </Typography>
                      <Typography variant="h4" sx={{ color: "#e58a8a" }}>
                        {desk?.name ?? current.deskName ?? "the service desk"}
                      </Typography>
                    </Box>
                  );
                })
              ) : (
                <Typography variant="h5" sx={{ color: "#b86666" }}>
                  Waiting for next call
                </Typography>
              )}
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};

const DisplayMessage = ({
  children,
  onBack,
}: {
  children: string;
  onBack: () => void;
}) => (
  <Box
    sx={{
      minHeight: "100vh",
      p: 4,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
      textAlign: "center",
      backgroundColor: "#090a0c",
      color: "#d98282",
    }}
  >
    <Typography variant="h4" sx={{ color: "#e58a8a" }}>
      {children}
    </Typography>
    <Button
      variant="contained"
      onClick={onBack}
      sx={{
        backgroundColor: "#8f3f45",
        color: "#ffe7e7",
        "&:hover": { backgroundColor: "#aa4b52" },
      }}
    >
      Back to Staff Workspace
    </Button>
  </Box>
);

export default StaffNumberDisplay;
