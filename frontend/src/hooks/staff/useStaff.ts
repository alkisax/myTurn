import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { backendUrl } from "../../constants/constants";
import { UserAuthContext } from "../../authLogin/context/UserAuthContext";
import type {
  Company,
  StaffContextValue,
  StaffDesk,
  StaffSession,
  Ticket,
} from "../../context/StaffContextDefinition";

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const useStaff = (): StaffContextValue => {
  const { user, isLoading: authLoading } = useContext(UserAuthContext);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [desks, setDesks] = useState<StaffDesk[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [selectedDesk, setSelectedDesk] = useState<StaffDesk | null>(null);
  const [session, setSession] = useState<StaffSession | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [currentTicket, setCurrentTicket] = useState<Ticket | null>(null);
  const [startingSession, setStartingSession] = useState(false);
  const [workspaceLoading, setWorkspaceLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    let ignore = false;

    axios
      .get(`${backendUrl}/company-users/mine`, authConfig())
      .then((response) => {
        if (!ignore) {
          setCompanies(response.data.data);
        }
      })
      .catch((error: unknown) => {
        if (!ignore) {
          console.error("Failed to fetch staff companies:", error);
        }
      });

    return () => {
      ignore = true;
    };
  }, [authLoading, user]);

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    let ignore = false;

    axios
      .get(`${backendUrl}/staff-sessions/mine`, authConfig())
      .then((response) => {
        const recovered: StaffSession | null = response.data.data;

        if (!recovered || ignore) {
          return;
        }

        return Promise.all([
          axios.get(
            `${backendUrl}/staff/companies/${recovered.companyId}/desks`,
            authConfig()
          ),
          axios.get(
            `${backendUrl}/staff-sessions/mine/serving-ticket`,
            authConfig()
          ),
        ]).then(([deskResponse, servingTicketResponse]) => {
          if (ignore) {
            return;
          }

          const recoveredDesks: StaffDesk[] = deskResponse.data.data;
          setSession(recovered);
          setSelectedCompanyId(recovered.companyId);
          setDesks(recoveredDesks);
          setSelectedDesk(
            recoveredDesks.find(
              (desk) => desk.id === recovered.deskId
            ) ?? null
          );
          setCurrentTicket(servingTicketResponse.data.data);
        });
      })
      .catch((error: unknown) => {
        if (!ignore) {
          console.error("Failed to restore staff session:", error);
        }
      });

    return () => {
      ignore = true;
    };
  }, [authLoading, user]);

  useEffect(() => {
    if (!session) {
      return;
    }

    let ignore = false;

    axios
      .get(`${backendUrl}/tickets/queue/${session.queueId}`, authConfig())
      .then((response) => {
        if (!ignore) {
          setTickets(response.data.data);
        }
      })
      .catch((error: unknown) => {
        if (!ignore) {
          console.error("Failed to fetch queue tickets:", error);
        }
      });

    return () => {
      ignore = true;
    };
  }, [session]);

  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === selectedCompanyId),
    [companies, selectedCompanyId]
  );
  const isBreak = Boolean(session?.status === "BREAK");
  const waitingTickets = useMemo(
    () => tickets.filter((ticket) => ticket.status === "WAITING"),
    [tickets]
  );
  const servingTickets = useMemo(
    () => tickets.filter((ticket) => ticket.status === "SERVING"),
    [tickets]
  );
  const missedTickets = useMemo(
    () => tickets.filter((ticket) => ticket.status === "MISSED"),
    [tickets]
  );

  const refreshTickets = async () => {
    if (!session) {
      return;
    }

    const response = await axios.get(
      `${backendUrl}/tickets/queue/${session.queueId}`,
      authConfig()
    );

    setTickets(response.data.data);
  };

  const selectCompany = async (companyId: number) => {
    try {
      setSelectedCompanyId(companyId);
      setSelectedDesk(null);

      const response = await axios.get(
        `${backendUrl}/staff/companies/${companyId}/desks`,
        authConfig()
      );

      setDesks(response.data.data);
    } catch (error) {
      console.error("Failed to fetch staff desks:", error);
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

  const action = async (
    request: () => Promise<void>,
    message: string
  ) => {
    setWorkspaceLoading(true);
    setErrorMessage("");

    try {
      await request();
    } catch (error: unknown) {
      setErrorMessage(
        axios.isAxiosError(error)
          ? error.response?.data?.message || message
          : message
      );
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
      const response = await axios.post(
        `${backendUrl}/staff-sessions`,
        { deskId: selectedDesk.id },
        authConfig()
      );

      setSession(response.data.data);
    } catch (error: unknown) {
      setErrorMessage(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to start staff session"
          : "Failed to start staff session"
      );
    } finally {
      setStartingSession(false);
    }
  };

  const nextCustomer = async () => {
    await action(async () => {
      const response = await axios.post(
        `${backendUrl}/tickets/next`,
        {},
        authConfig()
      );

      setCurrentTicket(response.data.data);
      await refreshTickets();
    }, "Failed to get next customer");
  };

  const completeTicket = async () => {
    if (!currentTicket) {
      return;
    }

    await action(async () => {
      await axios.post(
        `${backendUrl}/tickets/${currentTicket.id}/complete`,
        { completionResult: "SUCCESS" },
        authConfig()
      );

      setCurrentTicket(null);
      await refreshTickets();
    }, "Failed to complete ticket");
  };

  const markMissed = async () => {
    if (!currentTicket) {
      return;
    }

    await action(async () => {
      await axios.post(
        `${backendUrl}/tickets/${currentTicket.id}/missed`,
        {},
        authConfig()
      );

      setCurrentTicket(null);
      await refreshTickets();
    }, "Failed to mark ticket as missed");
  };

  const recallTicket = async (ticketId: number) => {
    await action(async () => {
      const response = await axios.post(
        `${backendUrl}/tickets/${ticketId}/recall`,
        {},
        authConfig()
      );

      setCurrentTicket(response.data.data);
      await refreshTickets();
    }, "Failed to recall ticket");
  };

  const toggleBreak = async () => {
    if (!session) {
      return;
    }

    const newStatus = session.status === "BREAK" ? "ACTIVE" : "BREAK";

    await action(async () => {
      const response = await axios.put(
        `${backendUrl}/staff-sessions/${session.id}/status`,
        { status: newStatus },
        authConfig()
      );

      setSession(response.data.data);
    }, "Failed to change staff status");
  };

  const endShift = async () => {
    if (!session) {
      return;
    }

    await action(async () => {
      await axios.post(
        `${backendUrl}/staff-sessions/${session.id}/end`,
        {},
        authConfig()
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
