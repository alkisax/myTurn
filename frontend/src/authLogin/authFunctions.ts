// frontend\src\authLogin\authFunctions.ts
import type { IUser } from "./types/types"

type SetUser = (user: IUser | null) => void;


export const handleLogout = async (
  setUser: SetUser,
  navigate: (path: string) => void,
  redirectPath = "/"
) => {

  try {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");

    // Clear React state
    setUser(null);

    // Redirect
    navigate(redirectPath);
  } catch (error) {
    console.error("Error during universal logout:", error);
  }
};

