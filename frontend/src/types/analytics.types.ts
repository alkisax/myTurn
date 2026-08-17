// Response DTOs των Admin analytics endpoints.
export interface CompanyOverview {
  totalTickets: number;
  waitingTickets: number;
  servingTickets: number;
  completedTickets: number;
  missedTickets: number;
  expiredTickets: number;
  cancelledTickets: number;
  activeStaffCount: number;
}

export interface QueueAnalytics {
  queueId: number;
  queueName: string;
  ticketCount: number;
  waitingCount: number;
  servingCount: number;
  completedCount: number;
  missedCount: number;
  expiredCount: number;
}

export interface LocationAnalytics {
  locationId: number;
  locationName: string;
  ticketCount: number;
  completedCount: number;
  missedCount: number;
  expiredCount: number;
}

export interface StaffAnalytics {
  userId: number;
  username: string;
  name: string | null;
  totalServed: number;
  completed: number;
  success: number;
  failed: number;
  missed: number;
  averageServiceMinutes: number | null;
}

export interface CompletionStats {
  totalTickets: number;
  completed: number;
  success: number;
  failed: number;
  missed: number;
  expired: number;
  cancelled: number;
  completionRate: number;
}
