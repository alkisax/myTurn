import { useState } from "react";
import axios from "axios";

import { api } from "@/authLogin/services/api";
import { backendUrl } from "@/constants/constants";
import { getAuthHeaders } from "@/hooks/companySetupHooks/api";
import type { TicketIdentification } from "@/types/staff.types";

const useStaffTicketIdentification = () => {
  const [pin, setPin] = useState("");
  const [identification, setIdentification] =
    useState<TicketIdentification | null>(null);
  const [identifying, setIdentifying] = useState(false);
  const [identificationMessage, setIdentificationMessage] = useState("");

  const identifyTicket = async () => {
    setIdentification(null);
    setIdentificationMessage("");
    setIdentifying(true);

    try {
      const config = await getAuthHeaders();
      const response = await api.get(
        `${backendUrl}/tickets/identify-by-pin/${encodeURIComponent(pin)}`,
        config,
      );

      setIdentification(response.data.data);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setIdentificationMessage("Ticket not found");
      } else {
        setIdentificationMessage("Failed to search for ticket");
      }
    } finally {
      setIdentifying(false);
    }
  };

  return {
    pin,
    setPin,
    identification,
    identifying,
    identificationMessage,
    identifyTicket,
  };
};

export default useStaffTicketIdentification;
