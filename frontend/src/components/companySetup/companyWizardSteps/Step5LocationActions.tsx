// Step 5 του wizard: εμφανίζει τα queues, services και desks μιας location.

import { useState } from "react";
import { Button } from "@mui/material";

import useLocationSetupActions from "../../../hooks/companySetupHooks/useLocationSetupActions";
import CreateDeskForm from "../CreateDeskForm";
import CreateQueueForm from "../CreateQueueForm";
import CreateServiceForm from "../CreateServiceForm";
import type { CompanySummary } from "../../../types/company.types";
import type { Location } from "../../../types/location.types";

interface Props {
  company: CompanySummary;
  location: Location;
  onBack: () => void;
}

const Step5LocationActions = ({ company, location, onBack }: Props) => {
  const [showQueueForm, setShowQueueForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showDeskForm, setShowDeskForm] = useState(false);

  const { queues, services, desks, fetchQueues, fetchServices, fetchDesks } =
    useLocationSetupActions(location);

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold">Step 5 — Set up {location.name}</h1>
      <p>Company: {company.name}</p>
      {location.address && <p>Address: {location.address}</p>}

      <div className="flex w-full max-w-md flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">Queues</h2>
          <p>
            A queue is a waiting line, such as “General Service” or
            “Appointments”. Tickets are issued into a queue.
          </p>
          <Button
            variant="contained"
            onClick={() => setShowQueueForm((previous) => !previous)}
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
                <Button key={queue.id} variant="outlined">
                  {queue.name}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">Services</h2>
          <p>
            Services describe what a customer wants to do, such as “Passport
            Renewal” or “Information”. A ticket may include one or more
            services, and the service duration can help estimate waiting time.
          </p>
          <Button
            variant="contained"
            onClick={() => setShowServiceForm((previous) => !previous)}
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
                <Button key={service.id} variant="outlined">
                  {service.name}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">Desks</h2>
          <p>
            A desk is a physical or logical service position where a staff
            member serves customers. Every desk must be connected to one queue,
            so create a queue before adding a desk.
          </p>
          <Button
            variant="contained"
            disabled={queues.length === 0}
            onClick={() => setShowDeskForm((previous) => !previous)}
          >
            Add Desk
          </Button>
          {queues.length === 0 && (
            <p className="text-sm">Create a queue before adding a desk.</p>
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
                  (queueItem) => queueItem.id === desk.queueId,
                );

                return (
                  <Button key={desk.id} variant="outlined">
                    {desk.name}
                    {queue ? ` — ${queue.name}` : ""}
                  </Button>
                );
              })}
            </div>
          )}
        </div>

        <Button variant="outlined" onClick={onBack}>
          Back to Company
        </Button>
      </div>
    </div>
  );
};

export default Step5LocationActions;
