import { useEffect, useState } from "react";

import { api } from "@/authLogin/services/api";
import { backendUrl } from "@/constants/constants";
import type { TicketResult } from "@/types/ticket.types";

const usePublicTabletTicketResult = (result: TicketResult | null) => {
  const [trackingData, setTrackingData] = useState<TicketResult | null>(result);
  const [secondsRemaining, setSecondsRemaining] = useState(60);

  useEffect(() => {
    Promise.resolve().then(() => {
      setTrackingData(result);
      setSecondsRemaining(60);
    });

    if (!result?.ticket.trackingToken) {
      return;
    }

    let cancelled = false;

    api
      .get(`${backendUrl}/tickets/${result.ticket.trackingToken}`)
      .then((response) => {
        if (cancelled) {
          return;
        }

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
      });

    return () => {
      cancelled = true;
    };
  }, [result]);

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
  };
};

export default usePublicTabletTicketResult;
