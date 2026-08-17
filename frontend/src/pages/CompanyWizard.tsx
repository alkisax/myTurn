// frontend/src/pages/CompanyWizard.tsx

import { useContext } from "react";

import { UserAuthContext } from "../authLogin/context/UserAuthContext";

import Step1RegisterAdmin from "../components/companySetup/companyWizardSteps/Step1RegisterAdmin";
import Step2CreateFirstCompany from "../components/companySetup/companyWizardSteps/Step2CreateFirstCompany";
import Step3SelectCompany from "../components/companySetup/companyWizardSteps/Step3SelectCompany";
import Step4CompanyActions from "../components/companySetup/companyWizardSteps/Step4CompanyActions";
import Step5LocationActions from "../components/companySetup/companyWizardSteps/Step5LocationActions";
import useCompanyWizard from "../hooks/companySetupHooks/useCompanyWizard";

const CompanyWizard = () => {
  const { user, isLoading } = useContext(UserAuthContext);

  const isAdmin = Boolean(
    user?.roles.includes("ADMIN") || user?.roles.includes("SUPERADMIN"),
  );

  const {
    companies,
    companyLoading,
    showCompanyForm,
    setShowCompanyForm,
    selectedCompanyId,
    setSelectedCompanyId,
    selectedLocation,
    setSelectedLocation,
    fetchCompanies,
  } = useCompanyWizard(isAdmin);

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
        <h1 className="text-2xl font-bold">Company Wizard</h1>

        <p>You are currently logged in as {user.roles[0]}.</p>

        <p>You need an ADMIN account to create and manage a company.</p>
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

  if (selectedCompanyId !== null) {
    const selectedCompany = companies.find(
      (company) => company.id === selectedCompanyId,
    );

    if (selectedCompany) {
      // STEP 5
      if (selectedLocation) {
        return (
          <Step5LocationActions
            company={selectedCompany}
            location={selectedLocation}
            onBack={() => setSelectedLocation(null)}
          />
        );
      }

      // STEP 4
      return (
        <Step4CompanyActions
          company={selectedCompany}
          onSelectLocation={setSelectedLocation}
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
