import { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@mui/material";

import RegisterStaffPage from "../../../authLogin/loginBackend/RegisterStaffPage";
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

interface Props {
  company: Company;
}

const Step4CompanyActions = ({ company }: Props) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [showStaffForm, setShowStaffForm] = useState(false);

  // Initial load
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

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">
        Step 4 — Set up {company.name}
      </h1>

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
        <div className="mt-4 flex w-full max-w-md flex-col gap-2">
          <h2 className="text-lg font-bold">
            Staff members
          </h2>

          {staff.map((staffMember) => (
            <Button
              key={staffMember.id}
              variant="outlined"
              onClick={() => {
                console.log("Staff:", staffMember);
                console.log("Company:", company);
                console.log(
                  "Staff ↔ Company:",
                  staffMember.id,
                  company.id
                );
              }}
            >
              {staffMember.name || staffMember.username}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Step4CompanyActions;