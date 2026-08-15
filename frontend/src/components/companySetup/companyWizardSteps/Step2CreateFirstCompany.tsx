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
        Every queue in MyTurn belongs to a company and a location.
        Let&apos;s create your first company so you can start setting up
        your locations, queues and desks.
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