import { Box, Paper, Typography } from "@mui/material";
import { useContext } from "react";
import { UserAuthContext } from "../authLogin/context/UserAuthContext";

const StaffProfile = () => {
  const { user } = useContext(UserAuthContext);

  return (
    <Box sx={{ maxWidth: 640, mx: "auto", p: 2 }}>
      <Typography variant="h4" sx={{ mb: 1 }}>My Profile</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        This page shows the information associated with your MyTurn staff account.
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography><strong>Name:</strong> {user?.name || "Not provided"}</Typography>
        <Typography><strong>Username:</strong> {user?.username || "Not provided"}</Typography>
        <Typography><strong>Email:</strong> {user?.email || "Not provided"}</Typography>
        <Typography><strong>Role:</strong> {user?.roles.join(", ") || "Not provided"}</Typography>
        <Typography><strong>User ID:</strong> {user?.id || user?._id || "Not provided"}</Typography>
      </Paper>
    </Box>
  );
};

export default StaffProfile;
