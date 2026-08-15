// frontend/src/components/companySetup/companyWizardSteps/Step4CompanyActions.tsx

import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@mui/material";

import RegisterStaffPage from "../../../authLogin/loginBackend/RegisterStaffPage";
import CreateLocationForm from "../CreateLocationForm";
import { backendUrl } from "../../../constants/constants";
import type { Roles } from "../../../authLogin/types/types";

interface Company {
  id: number;
  name: string;
  missedTicketExpiryMinutes: number;
  defaultEstimatedServiceMinutes: number;
  createdAt: string;
}

interface Staff {
  id: number;
  username: string;
  name?: string;
  email?: string;
  role: Roles;
  createdAt: string;
  updatedAt: string;
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

interface Props {
  company: Company;
  onSelectLocation: (location: Location) => void;
}

const Step4CompanyActions = ({
  company,
  onSelectLocation,
}: Props) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [showStaffForm, setShowStaffForm] = useState(false);

  const [locations, setLocations] = useState<Location[]>([]);
  const [showLocationForm, setShowLocationForm] = useState(false);

  // Initial load STAFF
  useEffect(() => {
    let ignore = false;

    const token = localStorage.getItem("token");

    axios
      .get(
        `${backendUrl}/company-users/company/${company.id}/staff`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        if (!ignore) {
          setStaff(response.data.data);
        }
      })
      .catch((error) => {
        if (!ignore) {
          console.error("Failed to fetch staff:", error);
        }
      });

    return () => {
      ignore = true;
    };
  }, [company.id]);

  // Initial load LOCATIONS
  useEffect(() => {
    let ignore = false;

    const token = localStorage.getItem("token");

    axios
      .get(
        `${backendUrl}/locations/company/${company.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((response) => {
        if (!ignore) {
          setLocations(response.data.data);
        }
      })
      .catch((error) => {
        if (!ignore) {
          console.error("Failed to fetch locations:", error);
        }
      });

    return () => {
      ignore = true;
    };
  }, [company.id]);

  // Manual refresh μετά από create staff
  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${backendUrl}/company-users/company/${company.id}/staff`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStaff(response.data.data);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
    }
  };

  // Manual refresh μετά από create location
  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${backendUrl}/locations/company/${company.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLocations(response.data.data);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-bold">
        Step 4 — Set up {company.name}
      </h1>

      {/* STAFF */}
      <div className="flex w-full max-w-md flex-col gap-3">
        <h2 className="text-xl font-bold">
          Staff
        </h2>

        <p>
          Add staff members who will work at desks and serve tickets.
        </p>

        <Button
          variant="contained"
          onClick={() => setShowStaffForm((prev) => !prev)}
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
            <h3 className="font-bold">
              Staff members
            </h3>

            {staff.map((staffMember) => (
              <Button
                key={staffMember.id}
                variant="outlined"
              >
                {staffMember.name || staffMember.username}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* LOCATIONS */}
      <div className="flex w-full max-w-md flex-col gap-3">
        <h2 className="text-xl font-bold">
          Locations
        </h2>

        <p>
          Add locations where this company operates.
        </p>

        <Button
          variant="contained"
          onClick={() => setShowLocationForm((prev) => !prev)}
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
            <h3 className="font-bold">
              Locations
            </h3>

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