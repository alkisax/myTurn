import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { UserAuthContext } from "@/authLogin/context/UserAuthContext";
import { backendUrl } from "@/constants/constants";
import { getAuthHeaders, api } from "@/hooks/companySetupHooks/api";

interface UserAdStatusResponse {
  data: {
    hasPaid: boolean;
    adFreeUntil: string | null;
  };
}

export interface UserAdStatus {
  hasPaid: boolean;
  adFreeUntil: string | null;
}

export interface UserAdStatusContextValue extends UserAdStatus {
  loading: boolean;
  hidden: boolean;
  grantLoading: boolean;
  refreshAdStatus: () => Promise<UserAdStatus | null>;
  grantAdFree: () => Promise<boolean>;
}

const UserAdStatusContext = createContext<
  UserAdStatusContextValue | undefined
>(undefined);

export const UserAdStatusProvider = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const { user } = useContext(UserAuthContext);
  const [hasPaid, setHasPaid] = useState(false);
  const [adFreeUntil, setAdFreeUntil] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [grantLoading, setGrantLoading] = useState(false);
  const requestInFlightRef = useRef<Promise<UserAdStatus | null> | null>(null);
  const grantInFlightRef = useRef(false);

  const requestStatus = useCallback(
    (isCurrent: () => boolean = () => true) => {
    if (!user) {
      return Promise.resolve(null);
    }

    if (requestInFlightRef.current) {
      return requestInFlightRef.current;
    }

    const request = getAuthHeaders()
      .then((headers) =>
        api.get<UserAdStatusResponse>(
          `${backendUrl}/company-users/mine/ad-status`,
          headers,
        ),
      )
      .then((response) => {
        const status = response.data.data;
        if (isCurrent()) {
          setHasPaid(status.hasPaid);
          setAdFreeUntil(status.adFreeUntil);
          setHidden(false);
        }
        return status;
      })
      .catch(() => {
        if (isCurrent()) {
          setHidden(true);
        }
        return null;
      })
      .finally(() => {
        requestInFlightRef.current = null;
        if (isCurrent()) {
          setLoaded(true);
        }
      });

    requestInFlightRef.current = request;
      return request;
    },
    [user],
  );

  useEffect(() => {
    let ignore = false;

    if (user) {
      void requestStatus(() => !ignore);
    }

    return () => {
      ignore = true;
    };
  }, [requestStatus, user]);

  const refreshAdStatus = useCallback(async () => {
    if (!user) {
      return null;
    }

    setLoaded(false);
    return requestStatus();
  }, [requestStatus, user]);

  const grantAdFree = useCallback(async () => {
    if (!user || grantInFlightRef.current) {
      return false;
    }

    grantInFlightRef.current = true;
    setGrantLoading(true);

    try {
      const headers = await getAuthHeaders();
      const response = await api.post<UserAdStatusResponse>(
        `${backendUrl}/company-users/mine/ad-free`,
        undefined,
        headers,
      );
      const status = response.data.data;
      setHasPaid(status.hasPaid);
      setAdFreeUntil(status.adFreeUntil);
      setHidden(false);
      setLoaded(true);
      return true;
    } catch (error: unknown) {
      console.error("Failed to grant ad-free period:", error);
      return false;
    } finally {
      grantInFlightRef.current = false;
      setGrantLoading(false);
    }
  }, [user]);

  const contextValue = useMemo<UserAdStatusContextValue>(
    () => ({
      hasPaid,
      adFreeUntil,
      loading: user !== null && !loaded,
      hidden: !user || hidden,
      grantLoading,
      refreshAdStatus,
      grantAdFree,
    }),
    [
      adFreeUntil,
      grantAdFree,
      grantLoading,
      hasPaid,
      hidden,
      loaded,
      refreshAdStatus,
      user,
    ],
  );

  return (
    <UserAdStatusContext.Provider value={contextValue}>
      {children}
    </UserAdStatusContext.Provider>
  );
};

export const useUserAdStatusContext = () => {
  const context = useContext(UserAdStatusContext);

  if (!context) {
    throw new Error(
      "useUserAdStatusContext must be used within UserAdStatusProvider",
    );
  }

  return context;
};
