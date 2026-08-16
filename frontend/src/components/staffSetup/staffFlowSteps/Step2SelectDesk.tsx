// frontend/src/components/staffSetup/staffFlowSteps/Step2SelectDesk.tsx

import {
  Box,
  Button,
  Paper,
  Typography,
} from "@mui/material";

interface Company {
  id: number;
  name: string;
  slug: string;
}

interface StaffDesk {
  id: number;
  name: string;
  locationId: number;
  locationName: string;
  queueId: number;
  queueName: string;
  isActive: boolean;
}

interface Props {
  company: Company;
  desks: StaffDesk[];
  onSelectDesk: (desk: StaffDesk) => void;
  onBack: () => void;
}

const Step2SelectDesk = ({
  company,
  desks,
  onSelectDesk,
  onBack,
}: Props) => {
  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 600,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <Typography variant="h5">
        Step 2 — Choose your desk
      </Typography>

      <Typography>
        {company.name}
      </Typography>

      <Typography color="text.secondary">
        Select the desk where you are working today.
        Your desk determines which queue you will serve.
      </Typography>

      {desks.map((desk) => (
        <Paper
          key={desk.id}
          sx={{ p: 2 }}
        >
          <Typography variant="h6">
            {desk.name}
          </Typography>

          <Typography>
            Location: {desk.locationName}
          </Typography>

          <Typography>
            Queue: {desk.queueName}
          </Typography>

          <Button
            sx={{ mt: 2 }}
            variant="contained"
            disabled={!desk.isActive}
            onClick={() => onSelectDesk(desk)}
          >
            Select this desk
          </Button>
        </Paper>
      ))}

      {desks.length === 0 && (
        <Typography color="text.secondary">
          No desks are available for this organization.
        </Typography>
      )}

      <Button
        variant="text"
        onClick={onBack}
      >
        Back
      </Button>
    </Box>
  );
};

export default Step2SelectDesk;