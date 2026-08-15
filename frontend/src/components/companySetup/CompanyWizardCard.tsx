

// frontend/src/components/companySetup/CompanyWizardCard.tsx

import { useContext } from "react";
import { Link } from "react-router-dom";
import { Box, Button, Paper, Typography } from "@mui/material";

import { UserAuthContext } from "../../authLogin/context/UserAuthContext";

const CompanyWizardCard = () => {
  const { user, isLoading } = useContext(UserAuthContext);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const isAdmin =
    user?.roles.includes("ADMIN") ||
    user?.roles.includes("SUPERADMIN");

  return (
    <Paper
      elevation={3}
      sx={{
        width: 400,
        p: 3,
        textAlign: "center",
      }}
    >
      <Typography variant="h6" sx={{ mb: 1 }}>
        Add Company Wizard
      </Typography>

      <Typography variant="body2" sx={{ mb: 2 }}>
        You are {isAdmin ? "already an admin" : "not an admin yet"}.
      </Typography>

      <Box>
        <Button
          component={Link}
          to="/company-wizard"
          variant="outlined"
          fullWidth
        >
          Start
        </Button>
      </Box>
    </Paper>
  );
};

export default CompanyWizardCard;