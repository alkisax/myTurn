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
