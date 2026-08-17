import { createContext } from "react";
import type { Company, StaffDesk, StaffSession } from "../types/staff.types";
import type { Ticket, TicketService } from "../types/ticket.types";

export type { Company, StaffDesk, StaffSession, Ticket, TicketService };

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
