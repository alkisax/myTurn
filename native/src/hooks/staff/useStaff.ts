import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

import { UserAuthContext } from "@/authLogin/context/UserAuthContext";
import { api } from "@/authLogin/services/api";
import { backendUrl } from "@/constants/constants";
import type { StaffContextValue } from "@/context/StaffContextDefinition";
import { getAuthHeaders } from "@/hooks/companySetupHooks/api";
import type { QueueEvent } from "@/types/signalr.types";
import type { Company, StaffDesk, StaffSession } from "@/types/staff.types";
import type { Ticket } from "@/types/ticket.types";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (typeof message === "string") {
      return message;
    }
  }

  return fallback;
};

export const useStaff = (): StaffContextValue => {
  const { user, isLoading: authLoading } = useContext(UserAuthContext);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [desks, setDesks] = useState<StaffDesk[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null,
  );
  const [selectedDesk, setSelectedDesk] = useState<StaffDesk | null>(null);
  const [session, setSession] = useState<StaffSession | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [startingSession, setStartingSession] = useState(false);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === selectedCompanyId),
    [companies, selectedCompanyId],
  );

  const isBreak = session?.status === "BREAK";

  const waitingTickets = useMemo(
    () => tickets.filter((ticket) => ticket.status === "WAITING"),
    [tickets],
  );

  const servingTickets = useMemo(
    () => tickets.filter((ticket) => ticket.status === "SERVING"),
    [tickets],
  );

  const missedTickets = useMemo(
    () => tickets.filter((ticket) => ticket.status === "MISSED"),
    [tickets],
  );

  const refreshTickets = useCallback(async () => {
    if (!session) {
      return;
    }

    const config = await getAuthHeaders();
    const response = await api.get(
      `${backendUrl}/tickets/queue/${session.queueId}`,
      config,
    );

    setTickets(response.data.data);
  }, [session]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      setInitialLoading(false);
      return;
    }

    let cancelled = false;

    const loadInitialStaffState = async () => {
      setInitialLoading(true);
      setErrorMessage("");

      try {
        const config = await getAuthHeaders();
        const [companiesResponse, sessionResponse] = await Promise.all([
          api.get(`${backendUrl}/company-users/mine`, config),
          api.get(`${backendUrl}/staff-sessions/mine`, config),
        ]);

        if (cancelled) {
          return;
        }

        const availableCompanies: Company[] = companiesResponse.data.data;
        const recoveredSession: StaffSession | null = sessionResponse.data.data;

        setCompanies(availableCompanies);

        if (!recoveredSession) {
          return;
        }

        // Επαναφέρουμε τη βάρδια και το ticket που ήδη εξυπηρετεί ο χρήστης.
        const [desksResponse, servingTicketResponse] = await Promise.all([
          api.get(
            `${backendUrl}/staff/companies/${recoveredSession.companyId}/desks`,
            config,
          ),
          api.get(`${backendUrl}/staff-sessions/mine/serving-ticket`, config),
        ]);

        if (cancelled) {
          return;
        }

        const recoveredDesks: StaffDesk[] = desksResponse.data.data;

        setSession(recoveredSession);
        setSelectedCompanyId(recoveredSession.companyId);
        setDesks(recoveredDesks);
        setSelectedDesk(
          recoveredDesks.find(
            (desk) => desk.id === recoveredSession.deskId,
          ) ?? null,
        );
        setCurrentTicket(servingTicketResponse.data.data);
      } catch (error: unknown) {
        if (!cancelled) {
          setErrorMessage(
            getErrorMessage(error, "Failed to load the staff workspace"),
          );
        }
      } finally {
        if (!cancelled) {
          setInitialLoading(false);
        }
      }
    };

    void loadInitialStaffState();

    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  useEffect(() => {
    if (!session) {
      return;
    }

    void refreshTickets().catch((error: unknown) => {
      setErrorMessage(getErrorMessage(error, "Failed to load queue tickets"));
    });
  }, [refreshTickets, session]);

  useEffect(() => {
    if (!session) {
      return;
    }

    let disposed = false;
    const connection = new HubConnectionBuilder()
      .withUrl(`${backendUrl}/queue-hub`)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    const joinQueue = async () => {
      await connection.invoke("JoinQueue", session.queueId);
    };

    const refreshQueueOnEvent = (event: QueueEvent) => {
      if (disposed || Number(event.queueId) !== session.queueId) {
        return;
      }

      // Τα realtime events ζητούν νέο snapshot· η βάση παραμένει η πηγή αλήθειας.
      void refreshTickets().catch((error: unknown) => {
        setErrorMessage(
          getErrorMessage(error, "Failed to refresh queue tickets"),
        );
      });
    };

    connection.on("QueueTicketAdded", refreshQueueOnEvent);
    connection.on("NowServingChanged", refreshQueueOnEvent);
    connection.on("NowServingEnded", refreshQueueOnEvent);

    connection.onreconnected(() => {
      if (!disposed) {
        void joinQueue();
      }
    });

    const connect = async () => {
      try {
        await connection.start();

        if (!disposed) {
          await joinQueue();
        }
      } catch (error: unknown) {
        if (!disposed) {
          setErrorMessage(
            getErrorMessage(error, "Failed to connect to queue updates"),
          );
        }
      }
    };

    void connect();

    return () => {
      disposed = true;
      connection.off("QueueTicketAdded", refreshQueueOnEvent);
      connection.off("NowServingChanged", refreshQueueOnEvent);
      connection.off("NowServingEnded", refreshQueueOnEvent);
      void connection.stop();
    };
  }, [refreshTickets, session]);

  const selectCompany = async (companyId: number) => {
    setSelectedCompanyId(companyId);
    setSelectedDesk(null);
    setErrorMessage("");

    try {
      const config = await getAuthHeaders();
      const response = await api.get(
        `${backendUrl}/staff/companies/${companyId}/desks`,
        config,
      );

      setDesks(response.data.data);
    } catch (error: unknown) {
      setErrorMessage(
        getErrorMessage(error, "Failed to load available desks"),
      );
    }
  };

  const selectDesk = (desk: StaffDesk) => {
    setSelectedDesk(desk);
    setErrorMessage("");
  };

  const backToCompanySelection = () => {
    setSelectedCompanyId(null);
    setSelectedDesk(null);
    setDesks([]);
    setErrorMessage("");
  };

  const backToDeskSelection = () => {
    setSelectedDesk(null);
    setErrorMessage("");
  };

  const runWorkspaceAction = async (
    request: () => Promise<void>,
    fallbackMessage: string,
  ) => {
    setWorkspaceLoading(true);
    setErrorMessage("");

    try {
      await request();
    } catch (error: unknown) {
      setErrorMessage(getErrorMessage(error, fallbackMessage));
    } finally {
      setWorkspaceLoading(false);
    }
  };

  const startSession = async () => {
    if (!selectedDesk) {
      return;
    }

    setStartingSession(true);
    setErrorMessage("");

    try {
      const config = await getAuthHeaders();
      const response = await api.post(
        `${backendUrl}/staff-sessions`,
        { deskId: selectedDesk.id },
        config,
      );

      setSession(response.data.data);
    } catch (error: unknown) {
      setErrorMessage(
        getErrorMessage(error, "Failed to start staff session"),
      );
    } finally {
      setStartingSession(false);
    }
  };

  const nextCustomer = async () => {
    await runWorkspaceAction(async () => {
      const config = await getAuthHeaders();
      const response = await api.post(
        `${backendUrl}/tickets/next`,
        {},
        config,
      );

      setCurrentTicket(response.data.data);
      await refreshTickets();
    }, "Failed to get next customer");
  };

  const completeTicket = async () => {
    if (!currentTicket) {
      return;
    }

    await runWorkspaceAction(async () => {
      const config = await getAuthHeaders();
      await api.post(
        `${backendUrl}/tickets/${currentTicket.id}/complete`,
        { completionResult: "SUCCESS" },
        config,
      );

      setCurrentTicket(null);
      await refreshTickets();
    }, "Failed to complete ticket");
  };

  const markMissed = async () => {
    if (!currentTicket) {
      return;
    }

    await runWorkspaceAction(async () => {
      const config = await getAuthHeaders();
      await api.post(
        `${backendUrl}/tickets/${currentTicket.id}/missed`,
        {},
        config,
      );

      setCurrentTicket(null);
      await refreshTickets();
    }, "Failed to mark ticket as missed");
  };

  const recallTicket = async (ticketId: number) => {
    await runWorkspaceAction(async () => {
      const config = await getAuthHeaders();
      const response = await api.post(
        `${backendUrl}/tickets/${ticketId}/recall`,
        {},
        config,
      );

      setCurrentTicket(response.data.data);
      await refreshTickets();
    }, "Failed to recall ticket");
  };

  const toggleBreak = async () => {
    if (!session) {
      return;
    }

    const nextStatus = session.status === "BREAK" ? "ACTIVE" : "BREAK";

    await runWorkspaceAction(async () => {
      const config = await getAuthHeaders();
      const response = await api.put(
        `${backendUrl}/staff-sessions/${session.id}/status`,
        { status: nextStatus },
        config,
      );

      setSession(response.data.data);
    }, "Failed to change staff status");
  };

  const endShift = async () => {
    if (!session) {
      return;
    }

    await runWorkspaceAction(async () => {
      const config = await getAuthHeaders();
      await api.post(
        `${backendUrl}/staff-sessions/${session.id}/end`,
        {},
        config,
      );

      setSession(null);
      setSelectedDesk(null);
      setSelectedCompanyId(null);
      setDesks([]);
      setTickets([]);
      setCurrentTicket(null);
    }, "Failed to end shift");
  };

  return {
    companies,
    desks,
    selectedCompanyId,
    selectedCompany,
    selectedDesk,
    session,
    tickets,
    currentTicket,
    initialLoading,
    startingSession,
    workspaceLoading,
    errorMessage,
    isBreak,
    waitingTickets,
    servingTickets,
    missedTickets,
    waitingCount: waitingTickets.length,
    servingCount: servingTickets.length,
    missedCount: missedTickets.length,
    totalTickets: tickets.length,
    nextWaitingTicket: waitingTickets[0],
    selectCompany,
    selectDesk,
    backToCompanySelection,
    backToDeskSelection,
    startSession,
    refreshTickets,
    nextCustomer,
    completeTicket,
    markMissed,
    recallTicket,
    toggleBreak,
    endShift,
  };
};
