import { Box, Button, Paper, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useStaffContext } from "../context/useStaffContext";
import useStaffNumberDisplay from "../hooks/staffPageHooks/useStaffNumberDisplay";

const StaffNumberDisplay = () => {
  const navigate = useNavigate();
  const { session, selectedCompany, desks } = useStaffContext();
  const { queues, queueDisplayState, loading, desksById } =
    useStaffNumberDisplay({
      session,
      selectedCompany,
      desks,
    });

  if (!session) {
    return (
      <DisplayMessage onBack={() => navigate("/staff")}>
        This display requires an active staff session.
      </DisplayMessage>
    );
  }

  const columnCount = queues.length <= 3 ? queues.length || 1 : 2;

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 4 },
        display: "flex",
        flexDirection: "column",
        gap: 2,
        backgroundColor: "#090a0c",
        color: "#d98282",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography variant="h3" sx={{ color: "#e56f6f" }}>
          MyTurn
        </Typography>
        <Button
          size="small"
          variant="text"
          onClick={() => navigate("/staff")}
          sx={{ color: "#d98282" }}
        >
          Exit Number Display
        </Button>
      </Box>
      {loading && <Typography>Loading queues...</Typography>}
      {!loading && queues.length === 0 && (
        <Typography>
          No active queues are available at this location.
        </Typography>
      )}
      <Box
        sx={{
          display: "grid",
          alignItems: "start",
          gridTemplateColumns: {
            xs: "1fr",
            sm: `repeat(${columnCount}, minmax(0, 1fr))`,
          },
          gap: 2,
        }}
      >
        {queues.map((queue) => (
          <Paper
            key={queue.id}
            sx={{
              p: { xs: 3, sm: 5 },
              aspectRatio: "1 / 1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: 2,
              backgroundColor: "#17191d",
              color: "#d98282",
              border: "1px solid #3a2024",
              boxShadow: "0 8px 28px rgba(0, 0, 0, 0.35)",
            }}
          >
            <Typography variant="h4" sx={{ color: "#e58a8a" }}>
              {queue.name}
            </Typography>
            {(queueDisplayState[queue.id] ?? []).length > 0 ? (
              (queueDisplayState[queue.id] ?? []).map((current) => (
                <Box key={current.deskId}>
                  <Typography
                    variant="h1"
                    sx={{
                      fontFamily: '"DSEG7 Classic", sans-serif',
                      fontWeight: 700,
                      color: "#f06f6f",
                    }}
                  >
                    #{current.number}
                  </Typography>
                  <Typography variant="h6" sx={{ color: "#c96f6f" }}>
                    PLEASE GO TO
                  </Typography>
                  <Typography variant="h4" sx={{ color: "#e58a8a" }}>
                    {desksById.get(current.deskId)?.name ??
                      current.deskName ??
                      "the service desk"}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography variant="h5" sx={{ color: "#b86666" }}>
                Waiting for next call
              </Typography>
            )}
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

const DisplayMessage = ({
  children,
  onBack,
}: {
  children: string;
  onBack: () => void;
}) => (
  <Box
    sx={{
      minHeight: "100vh",
      p: 4,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
      textAlign: "center",
      backgroundColor: "#090a0c",
      color: "#d98282",
    }}
  >
    <Typography variant="h4" sx={{ color: "#e58a8a" }}>
      {children}
    </Typography>
    <Button
      variant="contained"
      onClick={onBack}
      sx={{
        backgroundColor: "#8f3f45",
        color: "#ffe7e7",
        "&:hover": { backgroundColor: "#aa4b52" },
      }}
    >
      Back to Staff Workspace
    </Button>
  </Box>
);

export default StaffNumberDisplay;
