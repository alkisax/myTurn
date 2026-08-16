import { createContext } from "react";

export interface Company {
  id: number;
  name: string;
  slug: string;
}

export interface StaffDesk {
  id: number;
  name: string;
  locationId: number;
  locationName: string;
  queueId: number;
  queueName: string;
  isActive: boolean;
}

export interface StaffSession {
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

export interface TicketService {
  id: number;
  name: string;
}

export interface Ticket {
  id: number;
  number: number;
  status: string;
  services: TicketService[];
}

export interface StaffContextValue {
  companies: Company[];
  desks: StaffDesk[];
  selectedCompanyId: number | null;
  selectedCompany: Company | undefined;
  selectedDesk: StaffDesk | null;
  session: StaffSession | null;
  tickets: Ticket[];
  currentTicket: Ticket | null;
  startingSession: boolean;
  workspaceLoading: boolean;
  errorMessage: string;
  isBreak: boolean;
  waitingTickets: Ticket[];
  servingTickets: Ticket[];
  missedTickets: Ticket[];
  waitingCount: number;
  servingCount: number;
  missedCount: number;
  totalTickets: number;
  nextWaitingTicket: Ticket | undefined;
  selectCompany: (companyId: number) => Promise<void>;
  selectDesk: (desk: StaffDesk) => void;
  backToCompanySelection: () => void;
  backToDeskSelection: () => void;
  startSession: () => Promise<void>;
  refreshTickets: () => Promise<void>;
  nextCustomer: () => Promise<void>;
  completeTicket: () => Promise<void>;
  markMissed: () => Promise<void>;
  recallTicket: (ticketId: number) => Promise<void>;
  toggleBreak: () => Promise<void>;
  endShift: () => Promise<void>;
}

export const StaffContext = createContext<StaffContextValue | undefined>(
  undefined
);
