import { Button } from "@mui/material";

interface Company {
  id: number;
  name: string;
  missedTicketExpiryMinutes: number;
  defaultEstimatedServiceMinutes: number;
  createdAt: string;
}

interface Props {
  companies: Company[];
  selectedCompanyId: number | null;
  setSelectedCompanyId: React.Dispatch<React.SetStateAction<number | null>>;
  showCompanyForm: boolean;
  setShowCompanyForm: React.Dispatch<React.SetStateAction<boolean>>;
  onCompanyCreated: () => void;
}

import CreateCompanyForm from "../CreateCompanyForm";

const Step3SelectCompany = ({
  companies,
  selectedCompanyId,
  setSelectedCompanyId,
  showCompanyForm,
  setShowCompanyForm,
  onCompanyCreated,
}: Props) => {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">
        Step 3 — Select a company
      </h1>

      <p>Select the company you want to set up.</p>

      <div className="flex w-full max-w-md flex-col gap-2">
        {companies.map((company) => (
          <Button
            key={company.id}
            variant={selectedCompanyId === company.id ? "contained" : "outlined"}
            onClick={() => setSelectedCompanyId(company.id)}
          >
            {company.name}
          </Button>
        ))}

        <Button
          variant="text"
          onClick={() => setShowCompanyForm((prev) => !prev)}
        >
          + Add another company
        </Button>
      </div>

      {showCompanyForm && (
        <CreateCompanyForm onCreated={onCompanyCreated} />
      )}
    </div>
  );
};

export default Step3SelectCompany;