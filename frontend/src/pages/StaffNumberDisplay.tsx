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
  number: number;
  deskId: number;
}

const StaffNumberDisplay = () => {
  const navigate = useNavigate();
  const { session, selectedCompany, desks } = useStaffContext();
  const [queues, setQueues] = useState<PublicQueue[]>([]);
  const [queueDisplayState, setQueueDisplayState] = useState<
    Record<number, QueueDisplayState>
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

        return axios
          .get(`${publicBase}/${location.slug}/queues`)
          .then((queueResponse) => {
            if (ignore) {
              return;
            }

            setQueues(queueResponse.data.data);
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

      setQueueDisplayState((current) => ({
        ...current,
        [queueId]: {
          number: event.number,
          deskId: event.deskId,
        },
      }));
    };

    connection.on("NowServingChanged", handleNowServingChanged);

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
        minHeight: "100vh",
        p: { xs: 2, sm: 4 },
        display: "flex",
        flexDirection: "column",
        gap: 2,
        backgroundColor: "background.default",
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
        <Typography variant="h3">MyTurn</Typography>
        <Button
          size="small"
          variant="text"
          onClick={() => navigate("/staff")}
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
          flex: 1,
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: `repeat(${columnCount}, minmax(0, 1fr))`,
          },
          gap: 2,
        }}
      >
        {queues.map((queue) => {
          const current = queueDisplayState[queue.id];
          const desk = current ? desksById.get(current.deskId) : undefined;

          return (
            <Paper
              key={queue.id}
              sx={{
                p: { xs: 3, sm: 5 },
                minHeight: 260,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: 2,
              }}
            >
              <Typography variant="h4">{queue.name}</Typography>

              {current ? (
                <>
                  <Typography variant="h1" sx={{ fontWeight: 700 }}>
                    #{current.number}
                  </Typography>
                  <Typography variant="h6">PLEASE GO TO</Typography>
                  <Typography variant="h4">
                    {desk?.name ?? "the service desk"}
                  </Typography>
                </>
              ) : (
                <Typography variant="h5">
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
    }}
  >
    <Typography variant="h4">{children}</Typography>
    <Button variant="contained" onClick={onBack}>
      Back to Staff Workspace
    </Button>
  </Box>
);

export default StaffNumberDisplay;
