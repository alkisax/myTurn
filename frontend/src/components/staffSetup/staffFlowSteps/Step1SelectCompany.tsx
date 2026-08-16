// frontend/src/components/staffSetup/staffFlowSteps/Step1SelectCompany.tsx

import {
  Box,
  Button,
  Typography,
} from "@mui/material";
import type { Company } from "../../../context/StaffContextDefinition";

interface Props {
  companies: Company[];
  onSelectCompany: (companyId: number) => void;
}

const Step1SelectCompany = ({
  companies,
  onSelectCompany,
}: Props) => {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 500,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h5">
        Step 1 — Choose your organization
      </Typography>

      <Typography color="text.secondary">
        Select the organization where you are working today.
      </Typography>

      {companies.map((company) => (
        <Button
          key={company.id}
          variant="outlined"
          onClick={() => onSelectCompany(company.id)}
        >
          {company.name}
        </Button>
      ))}

      {companies.length === 0 && (
        <Typography color="text.secondary">
          No organizations are assigned to your account.
        </Typography>
      )}
    </Box>
  );
};

export default Step1SelectCompany;
