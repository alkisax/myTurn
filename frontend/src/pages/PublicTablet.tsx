import { type ReactNode } from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useStaffContext } from "../context/useStaffContext";
import usePublicTablet from "../hooks/publicPageHooks/usePublicTablet";

const PublicTablet = () => {
  const navigate = useNavigate();
  const { session, selectedCompany, selectedDesk, desks } = useStaffContext();
  const { number: servingNumber, deskId: servingDeskId } = usePublicTablet({
    session,
    selectedCompany,
  });

  if (!session) {
    return (
      <TabletLayout>
        <Typography variant="h4">Public tablet unavailable</Typography>
        <Typography>
          This public tablet requires an active staff session.
        </Typography>
        <Button variant="contained" onClick={() => navigate("/staff")}>
          Back to Staff Workspace
        </Button>
      </TabletLayout>
    );
  }

  const servingDesk = desks.find((desk) => desk.id === servingDeskId);

  return (
    <TabletLayout>
      <Typography variant="h3">MyTurn</Typography>
      <Typography variant="h5">NOW SERVING</Typography>
      <Paper sx={{ p: 4, textAlign: "center", width: "100%", maxWidth: 520 }}>
        {servingNumber === null ? (
          <Typography variant="h5">
            Waiting for the next customer call
          </Typography>
        ) : (
          <>
            <Typography variant="h1" sx={{ fontWeight: 700 }}>
              #{servingNumber}
            </Typography>
            <Typography variant="h5">Please go to</Typography>
            <Typography variant="h4">
              {servingDesk?.name ?? "the service desk"}
            </Typography>
          </>
        )}
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          {selectedCompany?.name} · {selectedDesk?.queueName}
        </Typography>
      </Paper>
      <Button
        variant="contained"
        size="large"
        onClick={() => navigate("/staff/public-tablet/issue")}
      >
        Issue a Ticket
      </Button>
      {/*
      <Button variant="text" onClick={() => navigate("/staff")}>
        Exit Public Tablet
      </Button>
      */}
    </TabletLayout>
  );
};

const TabletLayout = ({ children }: { children: ReactNode }) => (
  <Box
    sx={{
      minHeight: "100vh",
      p: { xs: 3, sm: 6 },
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
      textAlign: "center",
    }}
  >
    {children}
  </Box>
);

export default PublicTablet;
