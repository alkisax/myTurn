import type { ReactNode } from "react";

import { StaffContext } from "@/context/StaffContextDefinition";
import { useStaff } from "@/hooks/staff/useStaff";

export const StaffProvider = ({ children }: { children: ReactNode }) => {
  const staff = useStaff();

  return (
    <StaffContext.Provider value={staff}>{children}</StaffContext.Provider>
  );
};
