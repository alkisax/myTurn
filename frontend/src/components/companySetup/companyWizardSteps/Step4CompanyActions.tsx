// Step 4 του wizard: εμφανίζει staff και locations της organization.

import { useState } from "react";
import { Button } from "@mui/material";

import RegisterStaffPage from "../../../authLogin/loginBackend/RegisterStaffPage";
import useCompanySetupActions from "../../../hooks/companySetupHooks/useCompanySetupActions";
import CreateLocationForm from "../CreateLocationForm";
import type { CompanySummary } from "../../../types/company.types";
import type { Location } from "../../../types/location.types";

interface Props {
  company: CompanySummary;
  onSelectLocation: (location: Location) => void;
}

const Step4CompanyActions = ({ company, onSelectLocation }: Props) => {
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);

  const { staff, locations, fetchStaff, fetchLocations } =
    useCompanySetupActions(company);

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold">Step 4 — Set up {company.name}</h1>

      <div className="flex w-full max-w-md flex-col gap-3">
        <h2 className="text-xl font-bold">Staff</h2>
        <p>
          Staff are employees who serve customers. They will later start a work
          session at a desk, and staff accounts are created by the admin.
        </p>
        <Button
          variant="contained"
          onClick={() => setShowStaffForm((previous) => !previous)}
        >
          Add Staff Member
        </Button>

        {showStaffForm && (
          <RegisterStaffPage
            companyId={company.id}
            onCreated={() => {
              setShowStaffForm(false);
              void fetchStaff();
            }}
          />
        )}

        {staff.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="font-bold">Staff members</h3>
            {staff.map((staffMember) => (
              <Button key={staffMember.id} variant="outlined">
                {staffMember.name || staffMember.username}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="flex w-full max-w-md flex-col gap-3">
        <h2 className="text-xl font-bold">Locations</h2>
        <p>
          A location can be a branch, office, shop, or public service point.
          Queues, services, and desks are configured inside a location, and a
          company can have more than one location.
        </p>
        <Button
          variant="contained"
          onClick={() => setShowLocationForm((previous) => !previous)}
        >
          Add Location
        </Button>

        {showLocationForm && (
          <CreateLocationForm
            companyId={company.id}
            onCreated={() => {
              setShowLocationForm(false);
              void fetchLocations();
            }}
          />
        )}

        {locations.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="font-bold">Locations</h3>
            {locations.map((location) => (
              <Button
                key={location.id}
                variant="outlined"
                onClick={() => onSelectLocation(location)}
              >
                {location.name}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Step4CompanyActions;
