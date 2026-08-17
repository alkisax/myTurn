import { useState } from "react";
import axios from "axios";

import { backendUrl } from "../../constants/constants";
import type { TicketIdentification } from "../../types/staff.types";

interface Options {
  token: string | null;
}

// Hook για την αναζήτηση ticket με PIN μέσα στο STAFF workspace.
// Η αναζήτηση είναι μόνο για ταυτοποίηση και δεν αλλάζει το ticket.
const useStaffTicketIdentification = ({ token }: Options) => {
  const [pin, setPin] = useState("");
  const [identification, setIdentification] =
    useState<TicketIdentification | null>(null);
  const [identifying, setIdentifying] = useState(false);
  const [identificationMessage, setIdentificationMessage] = useState("");

  // Εκτελεί την αναζήτηση όταν ο staff πατήσει Search.
  const identifyTicket = async () => {
    setIdentification(null);
    setIdentificationMessage("");
    setIdentifying(true);

    try {
      const response = await axios.get(
        `${backendUrl}/tickets/identify-by-pin/${encodeURIComponent(pin)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
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
