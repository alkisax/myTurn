export interface AdminCompany {
  id: number;
  name: string;
  slug: string;
  missedTicketExpiryMinutes: number;
  defaultEstimatedServiceMinutes: number;
  createdAt: string;
}

export interface AdminLocation {
  id: number;
  companyId: number;
  name: string;
  slug: string;
  address: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  timeZoneId: string | null;
  isActive: boolean;
}

export interface AdminQueue {
  id: number;
  companyId: number;
  locationId: number;
  name: string;
  description: string | null;
  isActive: boolean;
  isRemoteTicketingAllowed: boolean;
  defaultServiceMinutes: number | null;
  maxWaitingTickets: number | null;
  opensAt: string | null;
  closesAt: string | null;
  resetNumberDaily: boolean;
  autoResetEnabled: boolean;
  resetAt: string | null;
}

export interface AdminService {
  id: number;
  locationId: number;
  queueId: number;
  name: string;
  description: string | null;
  estimatedServiceMinutes: number | null;
  isActive: boolean;
  isGeneric: boolean;
}

export interface AdminDesk {
  id: number;
  companyId: number;
  locationId: number;
  queueId: number;
  name: string;
  isActive: boolean;
}

export interface AdminStaffMember {
  id: number;
  username: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

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
