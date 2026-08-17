import { useEffect, useState } from "react";
import axios from "axios";

import { backendUrl } from "../../constants/constants";
import type { Location } from "../../types/location.types";
import type { QueueSummary } from "../../types/queue.types";
import type { ServiceSummary } from "../../types/service.types";
import type { DeskSummary } from "../../types/desk.types";

// Hook που φορτώνει τα στοιχεία αρχικής ρύθμισης μιας location.
// Το Step5LocationActions εμφανίζει queues, services και desks μέσω αυτού.
const useLocationSetupActions = (location: Location) => {
  const [queues, setQueues] = useState<QueueSummary[]>([]);
  const [services, setServices] = useState<ServiceSummary[]>([]);
  const [desks, setDesks] = useState<DeskSummary[]>([]);

  // Αρχική φόρτωση queues της επιλεγμένης location.
  useEffect(() => {
    let ignore = false;
    const token = localStorage.getItem("token");

    axios
      .get(`${backendUrl}/queues/location/${location.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (!ignore) {
          setQueues(response.data.data);
        }
      })
      .catch((error) => {
        if (!ignore) {
          console.error("Failed to fetch queues:", error);
        }
      });

    return () => {
      ignore = true;
    };
  }, [location.id]);

  // Αρχική φόρτωση services της επιλεγμένης location.
  useEffect(() => {
    let ignore = false;
    const token = localStorage.getItem("token");

    axios
      .get(`${backendUrl}/services/location/${location.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (!ignore) {
          setServices(response.data.data);
        }
      })
      .catch((error) => {
        if (!ignore) {
          console.error("Failed to fetch services:", error);
        }
      });

    return () => {
      ignore = true;
    };
  }, [location.id]);

  // Αρχική φόρτωση desks της επιλεγμένης location.
  useEffect(() => {
    let ignore = false;
    const token = localStorage.getItem("token");

    axios
      .get(`${backendUrl}/desks/location/${location.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (!ignore) {
          setDesks(response.data.data);
        }
      })
      .catch((error) => {
        if (!ignore) {
          console.error("Failed to fetch desks:", error);
        }
      });

    return () => {
      ignore = true;
    };
  }, [location.id]);

  // Οι refresh helpers καλούνται από τα callbacks των Create*Form components.
  const fetchQueues = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${backendUrl}/queues/location/${location.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setQueues(response.data.data);
    } catch (error) {
      console.error("Failed to fetch queues:", error);
    }
  };

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${backendUrl}/services/location/${location.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setServices(response.data.data);
    } catch (error) {
      console.error("Failed to fetch services:", error);
    }
  };

  const fetchDesks = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${backendUrl}/desks/location/${location.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setDesks(response.data.data);
    } catch (error) {
      console.error("Failed to fetch desks:", error);
    }
  };

  return {
    queues,
    services,
    desks,
    fetchQueues,
    fetchServices,
    fetchDesks,
  };
};

export default useLocationSetupActions;
