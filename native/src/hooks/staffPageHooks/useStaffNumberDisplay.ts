import { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

import { api } from "@/authLogin/services/api";
import { backendUrl } from "@/constants/constants";
import type {
  NowServingChangedEvent,
  NowServingEndedEvent,
} from "@/types/signalr.types";
import type {
  Company,
  PublicLocation,
  PublicNowServing,
  PublicQueue,
  QueueDisplayEntry,
  StaffDesk,
  StaffSession,
  StoredDisplayState,
} from "@/types/staff.types";

interface Options {
  session: StaffSession | null;
  selectedCompany: Company | undefined;
  desks: StaffDesk[];
}

const storageKey = "myturn:number-display:last-called";

const today = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
};

const readStoredEntries = async () => {
  const storedValue = await AsyncStorage.getItem(storageKey);

  if (!storedValue) {
    return {} as Record<string, QueueDisplayEntry>;
  }

  try {
    const storedState = JSON.parse(storedValue) as StoredDisplayState;

    if (storedState.date !== today()) {
      await AsyncStorage.removeItem(storageKey);
      return {};
    }

    return storedState.entries;
  } catch {
    await AsyncStorage.removeItem(storageKey);
    return {};
  }
};

const saveEntries = async (entries: Record<string, QueueDisplayEntry>) => {
  const state: StoredDisplayState = {
    date: today(),
    entries,
  };

  await AsyncStorage.setItem(storageKey, JSON.stringify(state));
};

const groupEntriesByQueue = (entries: Record<string, QueueDisplayEntry>) => {
  const nextState: Record<number, QueueDisplayEntry[]> = {};

  for (const entry of Object.values(entries)) {
    nextState[entry.queueId] = [
      ...(nextState[entry.queueId] ?? []),
      entry,
    ];
  }

  return nextState;
};

const useStaffNumberDisplay = ({ session, selectedCompany, desks }: Options) => {
  const [queues, setQueues] = useState<PublicQueue[]>([]);
  const [queueDisplayState, setQueueDisplayState] = useState<
    Record<number, QueueDisplayEntry[]>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session || !selectedCompany) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadDisplaySnapshot = async () => {
      setLoading(true);

      try {
        const publicBase = `${backendUrl}/public/${selectedCompany.slug}`;
        const locationResponse = await api.get(`${publicBase}/locations`);
        const location = (locationResponse.data.data as PublicLocation[]).find(
          (item) => item.id === session.locationId,
        );

        if (!location || cancelled) {
          return;
        }

        const [queueResponse, snapshotResponse] = await Promise.all([
          api.get(`${publicBase}/${location.slug}/queues`),
          api.get(`${publicBase}/${location.slug}/now-serving`),
        ]);

        if (cancelled) {
          return;
        }

        const entries = await readStoredEntries();

        for (const item of snapshotResponse.data.data as PublicNowServing[]) {
          entries[`${item.queueId}:${item.deskId}`] = {
            queueId: item.queueId,
            number: item.number,
            deskId: item.deskId,
            deskName: item.deskName,
          };
        }

        await saveEntries(entries);

        if (!cancelled) {
          setQueues(queueResponse.data.data);
          setQueueDisplayState(groupEntriesByQueue(entries));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadDisplaySnapshot();

    return () => {
      cancelled = true;
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

    const handleNowServingChanged = async (
      event: NowServingChangedEvent,
    ) => {
      const queueId = Number(event.queueId);

      if (!displayedQueueIds.has(queueId)) {
        return;
      }

      const entries = await readStoredEntries();
      const nextEntry: QueueDisplayEntry = {
        queueId,
        number: event.number,
        deskId: event.deskId,
      };

      entries[`${queueId}:${event.deskId}`] = nextEntry;
      await saveEntries(entries);

      if (!disposed) {
        setQueueDisplayState((current) => ({
          ...current,
          [queueId]: [
            ...(current[queueId] ?? []).filter(
              (entry) => entry.deskId !== event.deskId,
            ),
            nextEntry,
          ],
        }));
      }
    };

    const handleNowServingEnded = (_event: NowServingEndedEvent) => {
      // Διατηρούμε τον τελευταίο αριθμό ορατό, όπως στην υπάρχουσα Web οθόνη.
    };

    const joinQueues = async () => {
      for (const queueId of queueIds) {
        await connection.invoke("JoinQueue", queueId);
      }
    };

    connection.on("NowServingChanged", handleNowServingChanged);
    connection.on("NowServingEnded", handleNowServingEnded);
    connection.onreconnected(() => {
      if (!disposed) {
        void joinQueues();
      }
    });

    const connect = async () => {
      await connection.start();

      if (!disposed) {
        await joinQueues();
      }
    };

    void connect();

    return () => {
      disposed = true;
      connection.off("NowServingChanged", handleNowServingChanged);
      connection.off("NowServingEnded", handleNowServingEnded);

      const disconnect = async () => {
        if (connection.state === "Connected") {
          for (const queueId of queueIds) {
            await connection.invoke("LeaveQueue", queueId);
          }
        }

        if (connection.state !== "Disconnected") {
          await connection.stop();
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
      locationDesks.map((desk) => [desk.id, desk]),
    );
  }, [desks, session]);

  return {
    queues,
    queueDisplayState,
    loading,
    desksById,
  };
};

export default useStaffNumberDisplay;
