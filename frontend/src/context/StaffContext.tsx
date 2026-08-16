import type { ReactNode } from "react";
import { useStaff } from "../hooks/staff/useStaff";
import { StaffContext } from "./StaffContextDefinition";

export const StaffProvider = ({ children }: { children: ReactNode }) => {
  const staff = useStaff();

  return (
    <StaffContext.Provider value={staff}>
      {children}
    </StaffContext.Provider>
  );
};
