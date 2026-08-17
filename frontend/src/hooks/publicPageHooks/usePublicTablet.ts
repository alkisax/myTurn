import { useEffect, useState } from "react";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import axios from "axios";
import { backendUrl } from "../../constants/constants";
import type { Company, StaffSession } from "../../types/staff.types";
import type {
  NowServingChangedEvent,
  NowServingEndedEvent,
} from "../../types/signalr.types";

interface Options {
  session: StaffSession | null;
  selectedCompany: Company | undefined;
}

interface PublicNowServing {
  deskId: number;
  number: number;
  queueId: number;
}

interface DisplayState {
  number: number | null;
  deskId: number | null;
}

interface StoredPublicTabletState {
  date: string;
  queueId: number;
  deskId: number;
  number: number;
}

const storageKey = "myturn:public-tablet:last-called";

const getToday = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const readStoredState = (): StoredPublicTabletState | null => {
  const storedValue = localStorage.getItem(storageKey);

  if (!storedValue) {
    return null;
  }

  try {
    const storedState = JSON.parse(storedValue) as StoredPublicTabletState;

    if (storedState.date !== getToday()) {
      localStorage.removeItem(storageKey);
      return null;
    }

    return storedState;
  } catch {
    localStorage.removeItem(storageKey);
    return null;
  }
};

const saveStoredState = (state: Omit<StoredPublicTabletState, "date">) => {
  localStorage.setItem(
    storageKey,
    JSON.stringify({ date: getToday(), ...state }),
  );
};

// Hook για snapshot και realtime ενημερώσεις της public tablet οθόνης.
const usePublicTablet = ({ session, selectedCompany }: Options) => {
  const [displayState, setDisplayState] = useState<DisplayState>({
    number: null,
    deskId: null,
  });

  useEffect(() => {
    if (!session || !selectedCompany) {
      return;
    }

    let ignore = false;
    const publicBase = `${backendUrl}/public/${selectedCompany.slug}`;

    // Φορτώνουμε το αρχικό now-serving snapshot για τη location του session.
    axios
      .get(`${publicBase}/locations`)
      .then((response) => {
        const locations = response.data.data as Array<{
          id: number;
          slug: string;
        }>;
        const location = locations.find(
          (item) => item.id === session.locationId,
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

            const snapshot = snapshotResponse.data.data as PublicNowServing[];
            const current = snapshot.find(
              (item) => item.deskId === session.deskId,
            );
            const stored = readStoredState();
            const storedForSession =
              stored?.deskId === session.deskId &&
              stored.queueId === session.queueId
                ? stored
                : null;
            const currentDisplay = current ?? storedForSession;

            setDisplayState({
              number: currentDisplay?.number ?? null,
              deskId: currentDisplay?.deskId ?? null,
            });

            if (current) {
              saveStoredState({
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

    const handleNowServingChanged = (event: NowServingChangedEvent) => {
      if (
        event.queueId !== session.queueId ||
        event.deskId !== session.deskId
      ) {
        return;
      }

      setDisplayState({
        number: event.number,
        deskId: event.deskId,
      });
      saveStoredState({
        queueId: Number(event.queueId),
        deskId: event.deskId,
        number: event.number,
      });
    };

    const handleNowServingEnded = (event: NowServingEndedEvent) => {
      if (
        event.queueId !== session.queueId ||
        event.deskId !== session.deskId
      ) {
        return;
      }

      // Κρατάμε τον τελευταίο αριθμό ορατό μετά το τέλος της εξυπηρέτησης.
    };

    connection.on("NowServingChanged", handleNowServingChanged);
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

  return displayState;
};

export default usePublicTablet;
