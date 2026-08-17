// DTOs για public ticket creation και public ticket tracking.
export interface TicketInfoService {
  name: string;
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

export interface TicketNowServingEntry {
  deskId: number;
  deskName: string;
  number: number;
}

export interface TicketInfoData {
  number: number;
  pin: string;
  status: string;
  services?: TicketInfoService[];
  estimatedWaitingMinutes: number;
  peopleAhead: number;
  nowServing: TicketNowServingEntry[];
}

export interface TicketResult {
  ticket: {
    number: number;
    pin: string;
    status: string;
    trackingToken: string;
    estimatedWaitingMinutes?: number;
  };
  queueName: string;
  serviceNames: string[];
}
