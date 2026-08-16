// frontend/src/pages/Staff.tsx

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Typography,
} from "@mui/material";

import { backendUrl } from "../constants/constants";

import Step1SelectCompany from "../components/staffSetup/staffFlowSteps/Step1SelectCompany";
import Step2SelectDesk from "../components/staffSetup/staffFlowSteps/Step2SelectDesk";
import Step3StartSession from "../components/staffSetup/staffFlowSteps/Step3StartSession";
import Step4StaffWorkspace from "../components/staffSetup/staffFlowSteps/Step4StaffWorkspace";

interface Company {
  id: number;
  name: string;
  slug: string;
}

interface StaffDesk {
  id: number;
  name: string;
  locationId: number;
  locationName: string;
  queueId: number;
  queueName: string;
  isActive: boolean;
}

interface StaffSession {
  id: number;
  userId: number;
  companyId: number;
  locationId: number;
  queueId: number;
  deskId: number;
  status: string;
  startedAt: string;
  breakStartedAt: string | null;
  totalBreakSeconds: number;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TicketService {
  id: number;
  name: string;
}

interface Ticket {
  id: number;
  number: number;
  status: string;
  services: TicketService[];
}

const Staff = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [desks, setDesks] = useState<StaffDesk[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const [selectedCompanyId, setSelectedCompanyId] =
    useState<number | null>(null);

  const [selectedDesk, setSelectedDesk] =
    useState<StaffDesk | null>(null);

  const [session, setSession] =
    useState<StaffSession | null>(null);

  const [currentTicket, setCurrentTicket] =
    useState<Ticket | null>(null);

  const [startingSession, setStartingSession] =
    useState(false);

  const [workspaceLoading, setWorkspaceLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  // Initial load των Companies του STAFF.
  useEffect(() => {
    let ignore = false;

    const token = localStorage.getItem("token");

    axios
      .get(`${backendUrl}/company-users/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (!ignore) {
          setCompanies(response.data.data);
        }
      })
      .catch((error) => {
        if (!ignore) {
          console.error(
            "Failed to fetch staff companies:",
            error
          );
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Restore τυχόν υπάρχον active StaffSession.
  useEffect(() => {
    let ignore = false;

    const token = localStorage.getItem("token");

    axios
      .get(`${backendUrl}/staff-sessions/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(async (response) => {
        if (ignore) return;

        const activeSession: StaffSession | null =
          response.data.data;

        if (!activeSession) {
          return;
        }

        const deskResponse = await axios.get(
          `${backendUrl}/staff/companies/${activeSession.companyId}/desks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (ignore) return;

        const staffDesks: StaffDesk[] =
          deskResponse.data.data;

        const activeDesk = staffDesks.find(
          (desk) =>
            desk.id === activeSession.deskId
        );

        setSession(activeSession);
        setSelectedCompanyId(
          activeSession.companyId
        );
        setDesks(staffDesks);

        if (activeDesk) {
          setSelectedDesk(activeDesk);
        }
      })
      .catch((error) => {
        if (!ignore) {
          console.error(
            "Failed to restore staff session:",
            error
          );
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Initial load των tickets όταν υπάρχει session.
  useEffect(() => {
    if (!session) {
      return;
    }

    let ignore = false;

    const token = localStorage.getItem("token");

    axios
      .get(
        `${backendUrl}/tickets/queue/${session.queueId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        if (!ignore) {
          setTickets(response.data.data);
        }
      })
      .catch((error) => {
        if (!ignore) {
          console.error(
            "Failed to fetch queue tickets:",
            error
          );
        }
      });

    return () => {
      ignore = true;
    };
  }, [session]);

  // Manual refresh μετά από ticket actions.
  const fetchTickets = async () => {
    if (!session) return;

    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${backendUrl}/tickets/queue/${session.queueId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTickets(response.data.data);
    } catch (error) {
      console.error(
        "Failed to fetch queue tickets:",
        error
      );
    }
  };

  const selectCompany = async (
    companyId: number
  ) => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${backendUrl}/staff/companies/${companyId}/desks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedCompanyId(companyId);
      setDesks(response.data.data);
    } catch (error) {
      console.error(
        "Failed to fetch staff desks:",
        error
      );
    }
  };

  const startSession = async () => {
    if (!selectedDesk) {
      return;
    }

    setStartingSession(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${backendUrl}/staff-sessions`,
        {
          deskId: selectedDesk.id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSession(response.data.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ||
            "Failed to start staff session"
        );
      } else {
        setErrorMessage(
          "Failed to start staff session"
        );
      }
    } finally {
      setStartingSession(false);
    }
  };

  const nextCustomer = async () => {
    setWorkspaceLoading(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${backendUrl}/tickets/next`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCurrentTicket(response.data.data);
      void fetchTickets();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ||
            "Failed to get next customer"
        );
      } else {
        setErrorMessage(
          "Failed to get next customer"
        );
      }
    } finally {
      setWorkspaceLoading(false);
    }
  };

  const completeTicket = async () => {
    if (!currentTicket) return;

    setWorkspaceLoading(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${backendUrl}/tickets/${currentTicket.id}/complete`,
        {
          completionResult: "SUCCESS",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCurrentTicket(null);
      void fetchTickets();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ||
            "Failed to complete ticket"
        );
      } else {
        setErrorMessage(
          "Failed to complete ticket"
        );
      }
    } finally {
      setWorkspaceLoading(false);
    }
  };

  const markMissed = async () => {
    if (!currentTicket) return;

    setWorkspaceLoading(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${backendUrl}/tickets/${currentTicket.id}/missed`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCurrentTicket(null);
      void fetchTickets();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ||
            "Failed to mark ticket as missed"
        );
      } else {
        setErrorMessage(
          "Failed to mark ticket as missed"
        );
      }
    } finally {
      setWorkspaceLoading(false);
    }
  };

  const recallTicket = async (
    ticketId: number
  ) => {
    setWorkspaceLoading(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${backendUrl}/tickets/${ticketId}/recall`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCurrentTicket(response.data.data);
      void fetchTickets();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ||
            "Failed to recall ticket"
        );
      } else {
        setErrorMessage(
          "Failed to recall ticket"
        );
      }
    } finally {
      setWorkspaceLoading(false);
    }
  };

  const toggleBreak = async () => {
    if (!session) return;

    setWorkspaceLoading(true);
    setErrorMessage("");

    const newStatus =
      session.status === "BREAK"
        ? "ACTIVE"
        : "BREAK";

    try {
      const token = localStorage.getItem("token");

      const response = await axios.put(
        `${backendUrl}/staff-sessions/${session.id}/status`,
        {
          status: newStatus,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSession(response.data.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ||
            "Failed to change staff status"
        );
      } else {
        setErrorMessage(
          "Failed to change staff status"
        );
      }
    } finally {
      setWorkspaceLoading(false);
    }
  };

  const endShift = async () => {
    if (!session) return;

    setWorkspaceLoading(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${backendUrl}/staff-sessions/${session.id}/end`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSession(null);
      setSelectedDesk(null);
      setSelectedCompanyId(null);
      setDesks([]);
      setTickets([]);
      setCurrentTicket(null);
      setErrorMessage("");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ||
            "Failed to end shift"
        );
      } else {
        setErrorMessage(
          "Failed to end shift"
        );
      }
    } finally {
      setWorkspaceLoading(false);
    }
  };

  const selectedCompany = companies.find(
    (company) =>
      company.id === selectedCompanyId
  );

  // STEP 4
  if (session && selectedDesk) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          p: 4,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Step4StaffWorkspace
          desk={selectedDesk}
          session={session}
          tickets={tickets}
          currentTicket={currentTicket}
          loading={workspaceLoading}
          errorMessage={errorMessage}
          onNext={() => {
            void nextCustomer();
          }}
          onComplete={() => {
            void completeTicket();
          }}
          onMissed={() => {
            void markMissed();
          }}
          onRecall={(ticketId) => {
            void recallTicket(ticketId);
          }}
          onToggleBreak={() => {
            void toggleBreak();
          }}
          onEndShift={() => {
            void endShift();
          }}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      <Typography variant="h4">
        Staff Workspace
      </Typography>

      {/* STEP 1 */}
      {!selectedCompany && (
        <Step1SelectCompany
          companies={companies}
          onSelectCompany={(companyId) => {
            void selectCompany(companyId);
          }}
        />
      )}

      {/* STEP 2 */}
      {selectedCompany && !selectedDesk && (
        <Step2SelectDesk
          company={selectedCompany}
          desks={desks}
          onSelectDesk={(desk) => {
            setSelectedDesk(desk);
            setErrorMessage("");
          }}
          onBack={() => {
            setSelectedCompanyId(null);
            setDesks([]);
            setErrorMessage("");
          }}
        />
      )}

      {/* STEP 3 */}
      {selectedCompany && selectedDesk && (
        <Step3StartSession
          company={selectedCompany}
          desk={selectedDesk}
          loading={startingSession}
          errorMessage={errorMessage}
          onStart={() => {
            void startSession();
          }}
          onBack={() => {
            setSelectedDesk(null);
            setErrorMessage("");
          }}
        />
      )}
    </Box>
  );
};

export default Staff;