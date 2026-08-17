import { Add, Delete, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import useAdminLocations from "../hooks/adminPageHooks/useAdminLocations";
import AdminPanelInfo from "./AdminPanelInfo";

interface Props {
  selectedCompanyId: number | null;
}

const AdminLocationsPanel = ({ selectedCompanyId }: Props) => {
  const admin = useAdminLocations(selectedCompanyId);

  if (selectedCompanyId === null) {
    return <Typography>Select an organization first.</Typography>;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <AdminPanelInfo title="About Locations">
        A location is a place where your organization serves customers. Use this
        panel to add, update, activate, or remove locations.
      </AdminPanelInfo>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">Locations</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={admin.openCreate}
        >
          Add Location
        </Button>
      </Box>
      {admin.errorMessage && (
        <Typography color="error" sx={{ mb: 2 }}>
          {admin.errorMessage}
        </Typography>
      )}
      {admin.loading && <Typography>Loading locations...</Typography>}
      {!admin.loading &&
        admin.locations.map((location) => (
          <Paper key={location.id} sx={{ p: 2, mb: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
            >
              <Box>
                <Typography variant="h6">{location.name}</Typography>
                <Typography color="text.secondary">
                  Slug: {location.slug}
                </Typography>
                <Typography>
                  {location.address || "No address"} {location.country || ""}
                </Typography>
                <Typography>
                  Time zone: {location.timeZoneId || "Not specified"}
                </Typography>
                <Typography>
                  Status: {location.isActive ? "Active" : "Inactive"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                <Tooltip title="Edit Location">
                  <IconButton
                    aria-label="Edit Location"
                    onClick={() => admin.openEdit(location)}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Location">
                  <IconButton
                    aria-label="Delete Location"
                    onClick={() => void admin.deleteLocation(location)}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Paper>
        ))}
      {!admin.loading && admin.locations.length === 0 && (
        <Typography color="text.secondary">No locations found.</Typography>
      )}

      <Dialog
        open={admin.dialogOpen}
        onClose={admin.closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {admin.editingLocation ? "Edit Location" : "Add Location"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
        >
          <TextField
            autoFocus
            label="Name"
            required
            value={admin.form.name}
            onChange={(e) => admin.updateForm("name", e.target.value)}
            fullWidth
          />
          <TextField
            label="Address"
            value={admin.form.address}
            onChange={(e) => admin.updateForm("address", e.target.value)}
            fullWidth
          />
          <TextField
            label="Country"
            value={admin.form.country}
            onChange={(e) => admin.updateForm("country", e.target.value)}
            fullWidth
          />
          <TextField
            label="Latitude"
            type="number"
            value={admin.form.latitude}
            onChange={(e) => admin.updateForm("latitude", e.target.value)}
            fullWidth
          />
          <TextField
            label="Longitude"
            type="number"
            value={admin.form.longitude}
            onChange={(e) => admin.updateForm("longitude", e.target.value)}
            fullWidth
          />
          <TextField
            label="Time zone"
            value={admin.form.timeZoneId}
            onChange={(e) => admin.updateForm("timeZoneId", e.target.value)}
            fullWidth
          />
          {admin.editingLocation && (
            <FormControlLabel
              control={
                <Switch
                  checked={admin.form.isActive}
                  onChange={(e) =>
                    admin.updateForm("isActive", e.target.checked)
                  }
                />
              }
              label="Active"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={admin.closeDialog} disabled={admin.saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void admin.saveLocation()}
            disabled={admin.saving}
          >
            {admin.saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminLocationsPanel;
// Admin panel για διαχείριση των locations της επιλεγμένης organization.
