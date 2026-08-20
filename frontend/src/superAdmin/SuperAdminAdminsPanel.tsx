import { useState } from "react";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import type { SuperAdminAdmin } from "../hooks/useSuperAdmin";

interface Props {
  admins: SuperAdminAdmin[];
  deletingAdminId: number | null;
  onDelete: (adminId: number) => Promise<void>;
}

const SuperAdminAdminsPanel = ({
  admins,
  deletingAdminId,
  onDelete,
}: Props) => {
  const [adminToDelete, setAdminToDelete] = useState<SuperAdminAdmin | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState("");

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
    </div>
  );
};

export default SuperAdminAdminsPanel;
