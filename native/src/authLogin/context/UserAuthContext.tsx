import { createContext, useCallback, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/authLogin/services/api";
import { backendUrl } from "../../constants/constants";
import type {
  BackendJwtPayload,
  IUser,
  UserAuthContextType,
  UserProviderProps,
} from "../types/types";

export const UserAuthContext = createContext<UserAuthContextType>({
  user: null,
  setUser: () => undefined,
  isLoading: true,
  setIsLoading: () => undefined,
  refreshUser: async () => undefined,
});

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const restoreUser = useCallback(async () => {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      setUser(null);
      return;
    }

    try {
      const decodedToken = jwtDecode<BackendJwtPayload>(token);

      if (
        typeof decodedToken.exp !== "number" ||
        decodedToken.exp * 1000 <= Date.now() ||
        !decodedToken.id ||
        !decodedToken.username ||
        !decodedToken.role
      ) {
        throw new Error("Invalid or expired token");
      }

      setUser({
        id: Number(decodedToken.id),
        username: decodedToken.username,
        role: decodedToken.role,
        roles: [decodedToken.role],
        provider: "backend",
      });
    } catch {
      // Αφαιρούμε μη έγκυρο token ώστε το UI να μην εμφανίσει ψεύτικη συνεδρία.
      await AsyncStorage.removeItem("token");
      setUser(null);
    }
  }, []);

  const refreshUser = async () => {
    setIsLoading(true);

    try {
      const currentToken = await AsyncStorage.getItem("token");

      if (currentToken) {
        const tokenResponse = await api.post(
          `${backendUrl}/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${currentToken}` } },
        );

        if (tokenResponse.data.status) {
          await AsyncStorage.setItem("token", tokenResponse.data.data.token);
        }
      }

      await restoreUser();
    } catch {
      await AsyncStorage.removeItem("token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    restoreUser().finally(() => setIsLoading(false));
  }, [restoreUser]);

  return (
    <UserAuthContext.Provider
      value={{ user, setUser, isLoading, setIsLoading, refreshUser }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};
