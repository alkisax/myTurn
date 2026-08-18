import type { ReactNode } from "react";
import type { JwtPayload } from "jwt-decode";

export type Roles = "SUPERADMIN" | "ADMIN" | "STAFF" | "USER";

export interface IUser {
  id: number;
  // Kept because the existing protected user screen still reads it.
  _id?: number;
  username: string;
  name?: string;
  email?: string;
  role: Roles;
  roles: Roles[];
  provider?: "backend";
}

export interface BackendJwtPayload extends JwtPayload {
  id: number | string;
  username: string;
  role: Roles;
}

export interface UserAuthContextType {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  refreshUser: () => Promise<void>;
}

export interface UserProviderProps {
  children: ReactNode;
}
