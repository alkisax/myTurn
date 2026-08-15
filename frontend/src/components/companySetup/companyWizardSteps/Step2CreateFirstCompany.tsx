import { Button } from "@mui/material";
import CreateCompanyForm from "../CreateCompanyForm";

interface Props {
  showCompanyForm: boolean;
  setShowCompanyForm: React.Dispatch<React.SetStateAction<boolean>>;
  onCompanyCreated: () => void;
}

const Step2CreateFirstCompany = ({
  showCompanyForm,
  setShowCompanyForm,
  onCompanyCreated,
}: Props) => {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">
        Step 2 — Create your first company
      </h1>

      <p className="max-w-lg text-center">
        A company is the main organization you manage in MyTurn. Your
        locations, staff, queues, desks, and services will be set up under
        this company.
      </p>

      <p className="max-w-lg text-center">
        You&apos;ll also choose how long an unclaimed ticket stays available
        and the usual time needed to serve a customer. These settings help
        MyTurn estimate waiting times.
      </p>

      <Button
        variant="contained"
        onClick={() => setShowCompanyForm(true)}
      >
        Create a new company
      </Button>

      {showCompanyForm && (
        <CreateCompanyForm onCreated={onCompanyCreated} />
      )}
    </div>
  );
};

export default Step2CreateFirstCompany;
