import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Switch,
  TextField,
} from "@mui/material";

import type { SuperAdminAdmin } from "../hooks/useSuperAdmin";

interface Props {
  admins: SuperAdminAdmin[];
  deletingAdminId: number | null;
  updatingAdStatusId: number | null;
  onDelete: (adminId: number) => Promise<void>;
  onUpdateAdStatus: (
    adminId: number,
    hasPaid: boolean,
    adFreeUntil: string | null,
  ) => Promise<void>;
}

const toDateTimeLocal = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const SuperAdminAdminsPanel = ({
  admins,
  deletingAdminId,
  updatingAdStatusId,
  onDelete,
  onUpdateAdStatus,
}: Props) => {
  const [adminToDelete, setAdminToDelete] = useState<SuperAdminAdmin | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState("");
  const [adminForMonetization, setAdminForMonetization] =
    useState<SuperAdminAdmin | null>(null);
  const [hasPaid, setHasPaid] = useState(false);
  const [adFreeUntil, setAdFreeUntil] = useState("");
  const [monetizationError, setMonetizationError] = useState("");

  const openMonetization = (admin: SuperAdminAdmin) => {
    setAdminForMonetization(admin);
    setHasPaid(admin.hasPaid);
    setAdFreeUntil(toDateTimeLocal(admin.adFreeUntil));
    setMonetizationError("");
  };

  const handleMonetizationSave = async () => {
    if (!adminForMonetization) return;

    setMonetizationError("");
    try {
      await onUpdateAdStatus(
        adminForMonetization.id,
        hasPaid,
        adFreeUntil ? new Date(adFreeUntil).toISOString() : null,
      );
      setAdminForMonetization(null);
    } catch (error: unknown) {
      setMonetizationError(
        error instanceof Error
          ? error.message
          : "The monetization status could not be updated.",
      );
    }
  };

  const handleDelete = async () => {
    if (!adminToDelete) {
      return;
    }

    setDeleteError("");

    try {
      await onDelete(adminToDelete.id);
      setAdminToDelete(null);
    } catch (error: unknown) {
      setDeleteError(
        error instanceof Error ? error.message : "The ADMIN account could not be deleted.",
      );
    }
  };

  return (
    <div>
      <Typography variant="h5" sx={{ mb: 1 }}>
        ADMIN accounts
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Review global ADMIN accounts and the Companies associated with them.
      </Typography>

      {admins.length === 0 ? (
        <Typography color="text.secondary">No ADMIN accounts found.</Typography>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Companies</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>{admin.username}</TableCell>
                  <TableCell>{admin.name || "—"}</TableCell>
                  <TableCell>{admin.email || "—"}</TableCell>
                  <TableCell>
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {admin.companies.length === 0 ? (
                      "—"
                    ) : (
                      admin.companies.map((company) => (
                        <Typography
                          key={company.id}
                          variant="body2"
                          color={company.adminCount > 1 ? "warning.main" : "text.primary"}
                        >
                          {company.name} ({company.adminCount} ADMINs)
                        </Typography>
                      ))
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      onClick={() => openMonetization(admin)}
                      disabled={
                        deletingAdminId !== null || updatingAdStatusId !== null
                      }
                      sx={{ mr: 1 }}
                    >
                      Monetization
                    </Button>
                    <Button
                      color="error"
                      variant="outlined"
                      onClick={() => setAdminToDelete(admin)}
                      disabled={deletingAdminId !== null}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog
        open={adminToDelete !== null}
        onClose={() => setAdminToDelete(null)}
      >
        <DialogTitle>Delete ADMIN account?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This permanently deletes the ADMIN, eligible Companies, Locations,
            Queues, Desks, Services, Tickets, Staff Sessions, and exclusive
            STAFF accounts. This cannot be undone.
          </DialogContentText>
          {deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdminToDelete(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => void handleDelete()}
            disabled={deletingAdminId !== null}
          >
            {deletingAdminId !== null ? "Deleting..." : "Delete permanently"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={adminForMonetization !== null}
        onClose={() => setAdminForMonetization(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Monetization</DialogTitle>
        <DialogContent>
          {adminForMonetization && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography>
                {adminForMonetization.name || adminForMonetization.username} (
                {adminForMonetization.username})
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={hasPaid}
                    onChange={(event) => setHasPaid(event.target.checked)}
                  />
                }
                label="Has Paid"
              />
              <TextField
                label="Ad Free Until"
                type="datetime-local"
                value={adFreeUntil}
                onChange={(event) => setAdFreeUntil(event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
                helperText="Leave empty to clear the ad-free period."
              />
              {monetizationError && (
                <Alert severity="error">{monetizationError}</Alert>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setAdminForMonetization(null)}
            disabled={updatingAdStatusId !== null}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleMonetizationSave()}
            disabled={updatingAdStatusId !== null}
          >
            {updatingAdStatusId !== null ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default SuperAdminAdminsPanel;
