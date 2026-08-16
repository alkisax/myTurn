import { useContext } from "react";
import { StaffContext } from "./StaffContextDefinition";

export const useStaffContext = () => {
  const context = useContext(StaffContext);

  if (!context) {
    throw new Error(
      "useStaffContext must be used within StaffProvider"
    );
  }

  return context;
};
