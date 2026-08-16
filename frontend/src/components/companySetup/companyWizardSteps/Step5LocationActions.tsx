// frontend/src/components/companySetup/companyWizardSteps/Step5LocationActions.tsx

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@mui/material";

import CreateQueueForm from "../CreateQueueForm";
import CreateServiceForm from "../CreateServiceForm";
import CreateDeskForm from "../CreateDeskForm";

import { backendUrl } from "../../../constants/constants";

interface Company {
  id: number;
  name: string;
  missedTicketExpiryMinutes: number;
  defaultEstimatedServiceMinutes: number;
  createdAt: string;
}

interface Location {
  id: number;
  companyId: number;
  name: string;
  address?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timeZoneId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Queue {
  id: number;
  companyId: number;
  locationId: number;
  name: string;
}

interface Service {
  id: number;
  companyId: number;
  locationId: number;
  name: string;
  description?: string | null;
  isActive: boolean;
  isGeneric: boolean;
  estimatedServiceMinutes?: number | null;
}

interface Desk {
  id: number;
  companyId: number;
  locationId: number;
  queueId: number;
  name: string;
  isActive: boolean;
}

interface Props {
  company: Company;
  location: Location;
  onBack: () => void;
}

const Step5LocationActions = ({
  company,
  location,
  onBack,
}: Props) => {
  const [queues, setQueues] = useState<Queue[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [desks, setDesks] = useState<Desk[]>([]);

  const [showQueueForm, setShowQueueForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showDeskForm, setShowDeskForm] = useState(false);

  // Initial QUEUES load
  useEffect(() => {
    let ignore = false;

    const token = localStorage.getItem("token");

    axios
      .get(
        `${backendUrl}/queues/location/${location.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        if (!ignore) {
          setQueues(response.data.data);
        }
      })
      .catch((error) => {
        if (!ignore) {
          console.error(
            "Failed to fetch queues:",
            error
          );
        }
      });

    return () => {
      ignore = true;
    };
  }, [location.id]);

  // Initial SERVICES load
  useEffect(() => {
    let ignore = false;

    const token = localStorage.getItem("token");

    axios
      .get(
        `${backendUrl}/services/location/${location.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        if (!ignore) {
          setServices(response.data.data);
        }
      })
      .catch((error) => {
        if (!ignore) {
          console.error(
            "Failed to fetch services:",
            error
          );
        }
      });

    return () => {
      ignore = true;
    };
  }, [location.id]);

  // Initial DESKS load
  useEffect(() => {
    let ignore = false;

    const token = localStorage.getItem("token");

    axios
      .get(
        `${backendUrl}/desks/location/${location.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        if (!ignore) {
          setDesks(response.data.data);
        }
      })
      .catch((error) => {
        if (!ignore) {
          console.error(
            "Failed to fetch desks:",
            error
          );
        }
      });

    return () => {
      ignore = true;
    };
  }, [location.id]);

  // Manual refresh μετά από create Queue
  const fetchQueues = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${backendUrl}/queues/location/${location.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setQueues(response.data.data);
    } catch (error) {
      console.error(
        "Failed to fetch queues:",
        error
      );
    }
  };

  // Manual refresh μετά από create Service
  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${backendUrl}/services/location/${location.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setServices(response.data.data);
    } catch (error) {
      console.error(
        "Failed to fetch services:",
        error
      );
    }
  };

  // Manual refresh μετά από create Desk
  const fetchDesks = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${backendUrl}/desks/location/${location.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setDesks(response.data.data);
    } catch (error) {
      console.error(
        "Failed to fetch desks:",
        error
      );
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold">
        Step 5 — Set up {location.name}
      </h1>

      <p>
        Company: {company.name}
      </p>

      {location.address && (
        <p>
          Address: {location.address}
        </p>
      )}

      <div className="flex w-full max-w-md flex-col gap-6">

        {/* QUEUES */}

        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">
            Queues
          </h2>

          <p>
            A queue is a waiting line, such as “General Service” or
            “Appointments”. Tickets are issued into a queue.
          </p>

          <Button
            variant="contained"
            onClick={() =>
              setShowQueueForm((prev) => !prev)
            }
          >
            Add Queue
          </Button>

          {showQueueForm && (
            <CreateQueueForm
              locationId={location.id}
              onCreated={() => {
                setShowQueueForm(false);
                void fetchQueues();
              }}
            />
          )}

          {queues.length > 0 && (
            <div className="flex flex-col gap-2">
              {queues.map((queue) => (
                <Button
                  key={queue.id}
                  variant="outlined"
                >
                  {queue.name}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* SERVICES */}

        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">
            Services
          </h2>

          <p>
            Services describe what a customer wants to do, such as “Passport
            Renewal” or “Information”. A ticket may include one or more
            services, and the service duration can help estimate waiting time.
          </p>

          <Button
            variant="contained"
            onClick={() =>
              setShowServiceForm((prev) => !prev)
            }
          >
            Add Service
          </Button>

          {showServiceForm && (
            <CreateServiceForm
              locationId={location.id}
              queues={queues}
              onCreated={() => {
                setShowServiceForm(false);
                void fetchServices();
              }}
            />
          )}

          {services.length > 0 && (
            <div className="flex flex-col gap-2">
              {services.map((service) => (
                <Button
                  key={service.id}
                  variant="outlined"
                >
                  {service.name}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* DESKS */}

        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">
            Desks
          </h2>

          <p>
            A desk is a physical or logical service position where a staff
            member serves customers. Every desk must be connected to one
            queue, so create a queue before adding a desk.
          </p>

          <Button
            variant="contained"
            disabled={queues.length === 0}
            onClick={() =>
              setShowDeskForm((prev) => !prev)
            }
          >
            Add Desk
          </Button>

          {queues.length === 0 && (
            <p className="text-sm">
              Create a queue before adding a desk.
            </p>
          )}

          {showDeskForm && (
            <CreateDeskForm
              locationId={location.id}
              queues={queues}
              onCreated={() => {
                setShowDeskForm(false);
                void fetchDesks();
              }}
            />
          )}

          {desks.length > 0 && (
            <div className="flex flex-col gap-2">
              {desks.map((desk) => {
                const queue = queues.find(
                  (queueItem) =>
                    queueItem.id === desk.queueId
                );

                return (
                  <Button
                    key={desk.id}
                    variant="outlined"
                  >
                    {desk.name}
                    {queue ? ` — ${queue.name}` : ""}
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        <Button
          variant="outlined"
          onClick={onBack}
        >
          Back to Company
        </Button>
      </div>
    </div>
  );
};

export default Step5LocationActions;
