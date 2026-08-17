import { useEffect, useState } from "react";
import axios from "axios";

import { backendUrl } from "../../constants/constants";
import type { TicketResult } from "../../types/ticket.types";

// Hook για την ενημέρωση του EWT και το countdown του ticket result screen.
const usePublicTabletTicketResult = (result: TicketResult | null) => {
  const [trackingData, setTrackingData] = useState<TicketResult | null>(result);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Ανανεώνουμε το estimated waiting time όταν αλλάζει το ticket result.
  useEffect(() => {
    Promise.resolve().then(() => {
      setTrackingData(result);
      setSecondsRemaining(60);
    });

    if (!result?.ticket.trackingToken) {
      return;
    }

    let ignore = false;

    Promise.resolve().then(() => {
      setLoading(true);
    });

    axios
      .get(`${backendUrl}/tickets/${result.ticket.trackingToken}`)
      .then((response) => {
        if (!ignore) {
          setTrackingData((current) => {
            if (!current) {
              return current;
            }

            return {
              ...current,
              ticket: {
                ...current.ticket,
                estimatedWaitingMinutes:
                  response.data.data.estimatedWaitingMinutes,
              },
            };
          });
        }
      })
      .catch((reason: unknown) => {
        if (!ignore) {
          setError(true);
          console.error("Failed to fetch ticket estimate:", reason);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [result]);

  // Το countdown είναι logic του result screen και δεν κάνει navigation.
  useEffect(() => {
    if (!result) {
      return;
    }

    const intervalId = setInterval(() => {
      setSecondsRemaining((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, [result]);

  return {
    trackingData,
    secondsRemaining,
    countdownFinished: secondsRemaining === 0,
    loading,
    error,
  };
};

export default usePublicTabletTicketResult;
