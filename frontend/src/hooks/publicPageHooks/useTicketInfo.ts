import { useEffect, useState } from "react";
import axios from "axios";

import { backendUrl } from "../../constants/constants";
import type { TicketInfoData } from "../../types/ticket.types";

// Hook για τη φόρτωση των στοιχείων ενός public tracked ticket.
const useTicketInfo = (trackingToken: string | undefined) => {
  const [ticket, setTicket] = useState<TicketInfoData | null>(null);
  const [error, setError] = useState(false);

  // Ζητάμε τα tracking στοιχεία κάθε φορά που αλλάζει το token.
  useEffect(() => {
    if (!trackingToken) {
      return;
    }

    let ignore = false;

    axios
      .get(`${backendUrl}/tickets/${trackingToken}`)
      .then((response) => {
        if (!ignore) {
          setTicket(response.data.data);
        }
      })
      .catch((error: unknown) => {
        if (!ignore) {
          setError(true);
          console.error("Failed to load ticket information:", error);
        }
      });

    return () => {
      ignore = true;
    };
  }, [trackingToken]);

  return {
    ticket,
    error,
  };
};

export default useTicketInfo;
