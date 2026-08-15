// frontend/src/pages/CompanyWizard.tsx

import { useContext, useEffect, useState } from "react";
import axios from "axios";

import { UserAuthContext } from "../authLogin/context/UserAuthContext";
import { backendUrl } from "../constants/constants";

import Step1RegisterAdmin from "../components/companySetup/companyWizardSteps/Step1RegisterAdmin";
import Step2CreateFirstCompany from "../components/companySetup/companyWizardSteps/Step2CreateFirstCompany";
import Step3SelectCompany from "../components/companySetup/companyWizardSteps/Step3SelectCompany";
import Step4CompanyActions from "../components/companySetup/companyWizardSteps/Step4CompanyActions";

interface Company {
  id: number;
  name: string;
  missedTicketExpiryMinutes: number;
  defaultEstimatedServiceMinutes: number;
  createdAt: string;
}

const CompanyWizard = () => {
  const { user, isLoading } = useContext(UserAuthContext);

  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] =
    useState<number | null>(null);

  const isAdmin = Boolean(
    user?.roles.includes("ADMIN") ||
    user?.roles.includes("SUPERADMIN")
  );

  // Initial load
  useEffect(() => {
    if (!isAdmin) return;

    let ignore = false;

    const token = localStorage.getItem("token");

    axios
      .get(`${backendUrl}/companies/mine`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (!ignore) {
          setCompanies(response.data.data);
        }
      })
      .catch((error) => {
        if (!ignore) {
          console.error("Failed to fetch companies:", error);
        }
      })
      .finally(() => {
        if (!ignore) {
          setCompanyLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [isAdmin]);

  // Manual refresh μετά από Create Company.
  const fetchCompanies = async () => {
    if (!isAdmin) return;

    setCompanyLoading(true);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${backendUrl}/companies/mine`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCompanies(response.data.data);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    } finally {
      setCompanyLoading(false);
    }
  };

  if (isLoading || (isAdmin && companyLoading)) {
    return <div>Loading...</div>;
  }

  // STEP 1
  if (!user) {
    return <Step1RegisterAdmin />;
  }

  // USER / STAFF
  if (!isAdmin) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">
          Company Wizard
        </h1>

        <p>
          You are currently logged in as {user.roles[0]}.
        </p>

        <p>
          You need an ADMIN account to create and manage a company.
        </p>
      </div>
    );
  }

  const handleCompanyCreated = () => {
    setShowCompanyForm(false);
    void fetchCompanies();
  };

  // STEP 2
  if (companies.length === 0) {
    return (
      <Step2CreateFirstCompany
        showCompanyForm={showCompanyForm}
        setShowCompanyForm={setShowCompanyForm}
        onCompanyCreated={handleCompanyCreated}
      />
    );
  }

  // STEP 4
  if (selectedCompanyId !== null) {
    const selectedCompany = companies.find(
      (company) => company.id === selectedCompanyId
    );

    if (selectedCompany) {
      return (
        <Step4CompanyActions
          company={selectedCompany}
        />
      );
    }
  }

  // STEP 3
  return (
    <Step3SelectCompany
      companies={companies}
      selectedCompanyId={selectedCompanyId}
      setSelectedCompanyId={setSelectedCompanyId}
      showCompanyForm={showCompanyForm}
      setShowCompanyForm={setShowCompanyForm}
      onCompanyCreated={handleCompanyCreated}
    />
  );
};

export default CompanyWizard;