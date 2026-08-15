// frontend\src\authLogin\context\UserAuthContext.tsx
import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import type {
  UserAuthContextType,
  UserProviderProps,
  BackendJwtPayload,
} from "../types/types";
import type { IUser } from "../types/types";
import { backendUrl } from "../../constants/constants";

// Provide a default value for createContext
// eslint-disable-next-line react-refresh/only-export-components
export const UserAuthContext = createContext<UserAuthContextType>({
  user: null,
  setUser: () => { },
  isLoading: true,
  setIsLoading: () => { },
  refreshUser: async () => { },
});

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("User updated:", user);
  }, [user]);

  const fetchUser = async () => {
    console.log("FETCH USER START");
    let provider: "backend" | "none" =
      "none";
    let decodedToken:
      | BackendJwtPayload
      | null = null;

    const token = localStorage.getItem("token");
    // αν έχει token παίρνουμε απο εκεί τον Provider
    if (token) {
      console.log("TOKEN:", token);
      try {
        decodedToken = jwtDecode<BackendJwtPayload>(token);
        provider = "backend";

        // αυτό εδώ το if το προσθέσαμε γιατί αν κάποιος ήταν logged in συνέχιζε να έχει access στις restricted pages ακόμα και αν το token του ήταν expired και έτρωγε 401 απο το backend
        if (
          !("exp" in decodedToken) ||
          typeof decodedToken.exp !== "number" ||
          decodedToken.exp * 1000 < Date.now()
        ) {
          localStorage.removeItem("token");
          setUser(null);
          setIsLoading(false);
          return;
        }
      } catch {
        localStorage.removeItem("token");
        provider = "none";
        setUser(null);
        setIsLoading(false)
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log("did not found token");
    }

    console.log("Current provider:", provider);
    // 2️⃣ Switch on provider
    switch (provider) {

      case "backend": {
        const backendUser = decodedToken as BackendJwtPayload;
        console.log("SETTING USER");
        setUser({
          _id: backendUser.id,
          username: backendUser.username,
          name: backendUser.name,
          email: backendUser.email,
          roles: [backendUser.role],
          hasPassword: true,
          provider: "backend",
        });
        break;
      }

      default:
        setUser(null);
        break;
    }
    setIsLoading(false);
    console.log("FETCH USER END");
  };

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const currentToken = localStorage.getItem("token");

      // Request a refreshed token from backend
      if (currentToken) {
        const tokenRes = await axios.post(
          `${backendUrl}/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${currentToken}` } }
        );

        if (tokenRes.data.status) {
          const newToken = tokenRes.data.data.token;
          localStorage.setItem("token", newToken);
          console.log("Refreshed token:", newToken);
        }
      }

      // Fetch the latest user info using the new token
      await fetchUser();
    } catch (err) {
      console.error("Failed to refresh user:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("INIT AUTH");
    // call async function inside effect to avoid synchronous setState in effect
    const init = async () => {
      await fetchUser();
    };
    void init();
  }, []);

  return (
    <UserAuthContext.Provider
      value={{ user, setUser, isLoading, setIsLoading, refreshUser }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};
