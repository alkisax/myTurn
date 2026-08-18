// native\src\authLogin\context\UserAuthContext.tsx

import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { api } from '@/authLogin/services/api'
import type {
  UserAuthContextType,
  UserProviderProps,
  BackendJwtPayload,
  IUser,
} from "../types/types";
import { backendUrl } from "../../constants/constants";
import AsyncStorage from '@react-native-async-storage/async-storage'

// Provide a default value for createContext
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
    console.log('USER STATE ID:', user?.id)
    console.log("User updated:", user);
  }, [user]);

  const fetchUser = async () => {
    console.log("FETCH USER START");

    let provider: "backend" | "none" =
      "none";
    let decodedToken:
      | BackendJwtPayload
      | null = null;

    // 🔥 RN: localStorage → AsyncStorage (async)
    const token = await AsyncStorage.getItem("token");

    // αν έχει token παίρνουμε απο εκεί τον Provider
    if (token) {
      // console.log("TOKEN:", token);
      try {
        decodedToken = jwtDecode<BackendJwtPayload>(token);
        provider = "backend";

        // αυτό εδώ το if το προσθέσαμε γιατί αν κάποιος ήταν logged in συνέχιζε να έχει access στις restricted pages ακόμα και αν το token του ήταν expired και έτρωγε 401 απο το backend
        // ⚠️ ignore expiration for offline-first
        // 🔐 OFFLINE-FIRST AUTH STRATEGY
        // κρατάμε το JWT στο AsyncStorage ώστε:
        // 1. να μείνει ο χρήστης logged in μετά από restart app
        // 2. να μπορούμε να δουλεύουμε OFFLINE (χωρίς backend)
        //
        // ⚠️ IMPORTANT:
        // ΔΕΝ ελέγχουμε expiration εδώ (exp)
        // γιατί:
        // - offline → δεν υπάρχει backend validation
        // - θέλουμε να συνεχίσει να δουλεύει το app (local DB)
        //
        // 👉 το token θεωρείται "UI session token"
        // 👉 το backend είναι η source of truth όταν ξαναγίνει online
        //
        // όταν ξαναγίνει request:
        // - αν είναι expired → backend θα δώσει 401
        // - τότε κάνουμε re-login ή refresh
        
        // το backend θα το ελέγξει όταν γίνει request
        // if (
        //   !("exp" in decodedToken) ||
        //   typeof decodedToken.exp !== "number" ||
        //   decodedToken.exp * 1000 < Date.now()
        // ) {
        //   await AsyncStorage.removeItem("token");
        //   setUser(null);
        //   setIsLoading(false);
        //   return;
        // }
      } catch {
        await AsyncStorage.removeItem("token");
        provider = "none";
        
        setUser(null);
        setIsLoading(false)
        return;
      }
      // finally {
      //   setIsLoading(false);
      // }
    } else {
      console.log("did not found token");
    }

    console.log("Current provider:", provider);
    // 2️⃣ Switch on provider
    switch (provider) {

      case "backend": {
        const backendUser = decodedToken as BackendJwtPayload;
        console.log("SETTING USER");
        console.log('DECODED TOKEN ID:', backendUser.id)
        setUser({
          id: Number(backendUser.id),
          username: backendUser.username,
          name: undefined,
          email: undefined,
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
      // 🔥 RN: async get token
      const currentToken = await AsyncStorage.getItem("token");

      // Request a refreshed token from backend
      if (currentToken) {
        const tokenRes = await api.post(
          `${backendUrl}/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${currentToken}` } }
        );

        if (tokenRes.data.status) {
          const newToken = tokenRes.data.data.token;

          // 🔥 RN: async set token
          await AsyncStorage.setItem("token", newToken);

          // console.log("Refreshed token:", newToken);
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
    fetchUser();
  }, []);

  return (
    <UserAuthContext.Provider
      value={{ user, setUser, isLoading, setIsLoading, refreshUser }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};