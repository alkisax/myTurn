import { Delete, People, Visibility, VisibilityOff } from "@mui/icons-material";
import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import useAdminStaff from "../hooks/adminPageHooks/useAdminStaff";
import AdminPanelInfo from "./AdminPanelInfo";

interface Props {
  selectedCompanyId: number | null;
}
const AdminStaffPanel = ({ selectedCompanyId }: Props) => {
  const admin = useAdminStaff(selectedCompanyId);
  const [showPassword, setShowPassword] = useState(false);
  if (selectedCompanyId === null)
    return <Typography>Select an organization first.</Typography>;
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <AdminPanelInfo title="About Staff">
        A staff member is a person with an account who serves customers in your
        organization. Use this panel to create staff accounts or remove their
        organization access. Staff are not permanently assigned to a desk here;
        when they start work, they choose an available desk, and that desk
        connects their work to a queue.
      </AdminPanelInfo>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">Staff</Typography>
        <Button
          variant="contained"
          startIcon={<People />}
          onClick={admin.openCreate}
        >
          Add Staff
        </Button>
      </Box>
      {admin.error && !admin.dialogOpen && (
        <Typography color="error" sx={{ mb: 2 }}>
          {admin.error}
        </Typography>
      )}
      {admin.loading && <Typography>Loading staff...</Typography>}
      {!admin.loading && admin.staff.length === 0 && (
        <Typography color="text.secondary">No staff members found.</Typography>
      )}
      {!admin.loading &&
        admin.staff.map((member) => (
          <Paper
            key={member.id}
            sx={{
              p: 2,
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="h6">
                {member.name || member.username}
              </Typography>
              <Typography>Username: {member.username}</Typography>
              <Typography>
                Email: {member.email || "Not provided"} · Role: {member.role}
              </Typography>
            </Box>
            <Tooltip title="Remove Staff">
              <IconButton
                aria-label="Remove Staff"
                onClick={() => void admin.remove(member)}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </Paper>
        ))}
      <Dialog
        open={admin.dialogOpen}
        onClose={admin.closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Staff</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
        >
          {admin.error && <Typography color="error">{admin.error}</Typography>}
          <TextField
            autoFocus
            required
            label="Username"
            value={admin.form.username}
            onChange={(event) =>
              admin.updateForm("username", event.target.value)
            }
          />
          <TextField
            label="Name"
            value={admin.form.name}
            onChange={(event) => admin.updateForm("name", event.target.value)}
          />
          <TextField
            label="Email"
            type="email"
            value={admin.form.email}
            onChange={(event) => admin.updateForm("email", event.target.value)}
          />
          <TextField
            required
            label="Password"
            type={showPassword ? "text" : "password"}
            value={admin.form.password}
            onChange={(event) =>
              admin.updateForm("password", event.target.value)
            }
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword((visible) => !visible)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            required
            label="Confirm password"
            type={showPassword ? "text" : "password"}
            value={admin.form.confirmPassword}
            onChange={(event) =>
              admin.updateForm("confirmPassword", event.target.value)
            }
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword((visible) => !visible)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={admin.closeDialog} disabled={admin.saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void admin.save()}
            disabled={admin.saving}
          >
            {admin.saving ? "Saving..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default AdminStaffPanel;
// Admin panel για organization-level staff accounts και membership.
