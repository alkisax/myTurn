// frontend/src/components/staffSetup/staffFlowSteps/Step3StartSession.tsx

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
  desk: StaffDesk;
  loading: boolean;
  errorMessage: string;
  onStart: () => void;
  onBack: () => void;
}

const Step3StartSession = ({
  company,
  desk,
  loading,
  errorMessage,
  onStart,
  onBack,
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
        Step 3 — Start your shift
      </Typography>

      <Typography color="text.secondary">
        Confirm your workplace before starting your staff session.
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">
          {company.name}
        </Typography>

        <Typography>
          Location: {desk.locationName}
        </Typography>

        <Typography>
          Desk: {desk.name}
        </Typography>

        <Typography>
          Queue: {desk.queueName}
        </Typography>
      </Paper>

      {errorMessage && (
        <Typography color="error">
          {errorMessage}
        </Typography>
      )}

      <Button
        variant="contained"
        disabled={loading}
        onClick={onStart}
      >
        {loading ? "Starting..." : "Start Shift"}
      </Button>

      <Button
        variant="text"
        disabled={loading}
        onClick={onBack}
      >
        Back
      </Button>
    </Box>
  );
};

export default Step3StartSession;