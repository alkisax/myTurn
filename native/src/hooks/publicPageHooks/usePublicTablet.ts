import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

import { api } from "@/authLogin/services/api";
import { backendUrl } from "@/constants/constants";
import type {
  NowServingChangedEvent,
  NowServingEndedEvent,
} from "@/types/signalr.types";
import type { Company, StaffSession } from "@/types/staff.types";

interface Options {
  session: StaffSession | null;
  selectedCompany: Company | undefined;
}

interface StoredState {
  date: string;
  queueId: number;
  deskId: number;
  number: number;
}

const storageKey = "myturn:public-tablet:last-called";

const today = () => new Date().toISOString().slice(0, 10);

const usePublicTablet = ({ session, selectedCompany }: Options) => {
  const [number, setNumber] = useState<number | null>(null);
  const [deskId, setDeskId] = useState<number | null>(null);

  useEffect(() => {
    if (!session || !selectedCompany) {
      return;
    }

    let cancelled = false;

    const loadSnapshot = async () => {
      const publicBase = `${backendUrl}/public/${selectedCompany.slug}`;
      const locationsResponse = await api.get(`${publicBase}/locations`);
      const location = (
        locationsResponse.data.data as Array<{ id: number; slug: string }>
      ).find((item) => item.id === session.locationId);

      if (!location || cancelled) {
        return;
      }

      const snapshotResponse = await api.get(
        `${publicBase}/${location.slug}/now-serving`,
      );
      const current = (
        snapshotResponse.data.data as Array<{
          queueId: number;
          deskId: number;
          number: number;
        }>
      ).find((item) => item.deskId === session.deskId);
      const storedValue = await AsyncStorage.getItem(storageKey);
      const stored = storedValue
        ? (JSON.parse(storedValue) as StoredState)
        : null;
      const storedForSession =
        stored?.date === today() &&
        stored.deskId === session.deskId &&
        stored.queueId === session.queueId
          ? stored
          : null;
      const display = current ?? storedForSession;

      if (!cancelled) {
        setNumber(display?.number ?? null);
        setDeskId(display?.deskId ?? null);
      }

      if (current) {
        await AsyncStorage.setItem(
          storageKey,
          JSON.stringify({ date: today(), ...current }),
        );
      }
    };

    void loadSnapshot();

    return () => {
      cancelled = true;
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

    const handleChanged = (event: NowServingChangedEvent) => {
      if (
        Number(event.queueId) !== session.queueId ||
        event.deskId !== session.deskId
      ) {
        return;
      }

      setNumber(event.number);
      setDeskId(event.deskId);
      void AsyncStorage.setItem(
        storageKey,
        JSON.stringify({
          date: today(),
          queueId: Number(event.queueId),
          deskId: event.deskId,
          number: event.number,
        }),
      );
    };

    const handleEnded = (_event: NowServingEndedEvent) => {
      // Ο τελευταίος αριθμός παραμένει ορατός μετά την εξυπηρέτηση.
    };

    connection.on("NowServingChanged", handleChanged);
    connection.on("NowServingEnded", handleEnded);
    void connection
      .start()
      .then(() => connection.invoke("JoinQueue", session.queueId));

    return () => {
      connection.off("NowServingChanged", handleChanged);
      connection.off("NowServingEnded", handleEnded);
      void connection.stop();
    };
  }, [session]);

  return { number, deskId };
};

export default usePublicTablet;
