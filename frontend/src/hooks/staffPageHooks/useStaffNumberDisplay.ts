import { useEffect, useMemo, useState } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import axios from "axios";
import { backendUrl } from "../../constants/constants";
import type { StaffDesk, StaffSession, Company } from "../../types/staff.types";
import type {
  NowServingChangedEvent,
  NowServingEndedEvent,
} from "../../types/signalr.types";

interface Options {
  session: StaffSession | null;
  selectedCompany: Company | undefined;
  desks: StaffDesk[];
}

interface PublicLocation {
  id: number;
  slug: string;
}
interface PublicQueue {
  id: number;
  name: string;
  isActive: boolean;
}
interface PublicNowServing {
  queueId: number;
  number: number;
  deskId: number;
  deskName: string;
}
interface QueueDisplayEntry {
  queueId: number;
  number: number;
  deskId: number;
  deskName?: string;
}
interface StoredDisplayState {
  date: string;
  entries: Record<string, QueueDisplayEntry>;
}

const storageKey = "myturn:number-display:last-called";

const today = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const readStoredEntries = (): Record<string, QueueDisplayEntry> => {
  const storedValue = localStorage.getItem(storageKey);
  if (!storedValue) return {};
  try {
    const storedState = JSON.parse(storedValue) as StoredDisplayState;
    if (storedState.date !== today()) {
      localStorage.removeItem(storageKey);
      return {};
    }
    return storedState.entries;
  } catch {
    localStorage.removeItem(storageKey);
    return {};
  }
};

const saveEntries = (entries: Record<string, QueueDisplayEntry>) => {
  localStorage.setItem(storageKey, JSON.stringify({ date: today(), entries }));
};

// Hook για queues, αρχικό snapshot και realtime multi-desk number display.
const useStaffNumberDisplay = ({
  session,
  selectedCompany,
  desks,
}: Options) => {
  const [queues, setQueues] = useState<PublicQueue[]>([]);
  const [queueDisplayState, setQueueDisplayState] = useState<
    Record<number, QueueDisplayEntry[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session || !selectedCompany) return;
    let ignore = false;
    const publicBase = `${backendUrl}/public/${selectedCompany.slug}`;
    axios
      .get(`${publicBase}/locations`)
      .then((response) => {
        const location = (response.data.data as PublicLocation[]).find(
          (item) => item.id === session.locationId,
        );
        if (!location || ignore) return;
        return Promise.all([
          axios.get(`${publicBase}/${location.slug}/queues`),
          axios.get(`${publicBase}/${location.slug}/now-serving`),
        ]).then(([queueResponse, snapshotResponse]) => {
          if (ignore) return;
          setQueues(queueResponse.data.data);
          const entries = readStoredEntries();
          for (const item of snapshotResponse.data.data as PublicNowServing[]) {
            entries[`${item.queueId}:${item.deskId}`] = {
              queueId: item.queueId,
              number: item.number,
              deskId: item.deskId,
              deskName: item.deskName,
            };
          }
          saveEntries(entries);
          const nextState: Record<number, QueueDisplayEntry[]> = {};
          for (const entry of Object.values(entries)) {
            nextState[entry.queueId] = [
              ...(nextState[entry.queueId] ?? []),
              entry,
            ];
          }
          setQueueDisplayState(nextState);
        });
      })
      .catch((error: unknown) => {
        if (!ignore)
          console.error("Failed to load number display queues:", error);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [selectedCompany, session]);

  useEffect(() => {
    if (!session || queues.length === 0) return;
    let disposed = false;
    const queueIds = queues.map((queue) => queue.id);
    const displayedQueueIds = new Set(queueIds);
    const connection = new HubConnectionBuilder()
      .withUrl(`${backendUrl}/queue-hub`)
      .configureLogging(LogLevel.Warning)
      .withAutomaticReconnect()
      .build();
    const handleNowServingChanged = (event: NowServingChangedEvent) => {
      const queueId = Number(event.queueId);
      if (!displayedQueueIds.has(queueId)) return;
      const entries = readStoredEntries();
      const nextEntry = { queueId, number: event.number, deskId: event.deskId };
      entries[`${queueId}:${event.deskId}`] = nextEntry;
      saveEntries(entries);
      setQueueDisplayState((current) => ({
        ...current,
        [queueId]: [
          ...(current[queueId] ?? []).filter(
            (entry) => entry.deskId !== event.deskId,
          ),
          nextEntry,
        ],
      }));
    };
    const handleNowServingEnded = (event: NowServingEndedEvent) => {
      const queueId = Number(event.queueId);
      if (!displayedQueueIds.has(queueId)) return;
      // Κρατάμε τον τελευταίο αριθμό ορατό, όπως έκανε η υπάρχουσα οθόνη.
    };
    connection.on("NowServingChanged", handleNowServingChanged);
    connection.on("NowServingEnded", handleNowServingEnded);
    const joinQueues = async () => {
      for (const queueId of queueIds)
        await connection.invoke("JoinQueue", queueId);
    };
    connection.onreconnected(() => {
      if (!disposed) void joinQueues();
    });
    const connect = async () => {
      try {
        await connection.start();
        if (!disposed) await joinQueues();
      } catch (error) {
        if (!disposed)
          console.error("Failed to connect number display to queues:", error);
      }
    };
    void connect();
    return () => {
      disposed = true;
      connection.off("NowServingChanged", handleNowServingChanged);
      connection.off("NowServingEnded", handleNowServingEnded);
      const disconnect = async () => {
        if (connection.state === "Connected") {
          for (const queueId of queueIds)
            await connection.invoke("LeaveQueue", queueId);
        }
        if (connection.state !== "Disconnected") await connection.stop();
      };
      void disconnect();
    };
  }, [queues, session]);

  const desksById = useMemo(() => {
    const locationDesks = session
      ? desks.filter((desk) => desk.locationId === session.locationId)
      : [];
    return new Map<number, StaffDesk>(
      locationDesks.map((desk) => [desk.id, desk]),
    );
  }, [desks, session]);
  return { queues, queueDisplayState, loading, desksById };
};

export default useStaffNumberDisplay;
