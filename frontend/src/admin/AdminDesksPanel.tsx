import { Delete, Desk, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { colors } from "../constants/constants";
import useAdminDesks from "../hooks/adminPageHooks/useAdminDesks";
import AdminPanelInfo from "./AdminPanelInfo";

interface Props {
  selectedCompanyId: number | null;
}
const selectorSx = {
  backgroundColor: colors.adminSelectorBackground,
  color: "#222",
  "& .MuiSvgIcon-root": { color: "#222" },
};
const AdminDesksPanel = ({ selectedCompanyId }: Props) => {
  const admin = useAdminDesks(selectedCompanyId);
  if (selectedCompanyId === null)
    return <Typography>Select an organization first.</Typography>;
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <AdminPanelInfo title="About Desks">
        A desk is a physical or screen-based service point where customers are
        called and served. Each desk belongs to one queue, and one queue can be
        served by many desks at the same time. A desk is not a staff member: it
        identifies where service happens, while staff members select an
        available desk when they start working.
      </AdminPanelInfo>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">Desks</Typography>
        {admin.selectedQueueId !== null && (
          <Button
            variant="contained"
            startIcon={<Desk />}
            onClick={admin.openCreate}
          >
            Add Desk
          </Button>
        )}
      </Box>
      {admin.locationsLoading && <Typography>Loading locations...</Typography>}
      {!admin.locationsLoading && admin.locations.length === 0 && (
        <Typography>No locations found for this organization.</Typography>
      )}
      {admin.locations.length > 0 && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Location</InputLabel>
          <Select
            label="Location"
            value={admin.selectedLocationId ?? ""}
            onChange={(event) =>
              admin.setSelectedLocationId(
                event.target.value ? Number(event.target.value) : null,
              )
            }
            sx={selectorSx}
          >
            <MenuItem value="">
              <em>Choose a location</em>
            </MenuItem>
            {admin.locations.map((location) => (
              <MenuItem key={location.id} value={location.id}>
                {location.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {admin.selectedLocationId !== null && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Queue</InputLabel>
          <Select
            label="Queue"
            value={admin.selectedQueueId ?? ""}
            onChange={(event) =>
              admin.setSelectedQueueId(
                event.target.value ? Number(event.target.value) : null,
              )
            }
            sx={selectorSx}
          >
            <MenuItem value="">
              <em>Choose a queue</em>
            </MenuItem>
            {admin.queues.map((queue) => (
              <MenuItem key={queue.id} value={queue.id}>
                {queue.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      {admin.error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {admin.error}
        </Typography>
      )}
      {admin.selectedLocationId === null && admin.locations.length > 0 && (
        <Typography>Select a location to manage its desks.</Typography>
      )}
      {admin.selectedLocationId !== null &&
        admin.queues.length === 0 &&
        !admin.queuesLoading && (
          <Typography>No queues found for this location.</Typography>
        )}
      {admin.selectedQueueId === null && admin.queues.length > 0 && (
        <Typography>Select a queue to manage its desks.</Typography>
      )}
      {admin.loading && <Typography>Loading desks...</Typography>}
      {!admin.loading &&
        admin.selectedQueueId !== null &&
        admin.desks.map((desk) => (
          <Paper
            key={desk.id}
            sx={{
              p: 2,
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="h6">{desk.name}</Typography>
              <Typography>
                Location:{" "}
                {admin.locations.find(
                  (location) => location.id === desk.locationId,
                )?.name ?? "-"}{" "}
                · Queue:{" "}
                {admin.queues.find((queue) => queue.id === desk.queueId)
                  ?.name ?? "-"}
              </Typography>
              <Typography>
                Status: {desk.isActive ? "Active" : "Inactive"}
              </Typography>
            </Box>
            <Box>
              <Tooltip title="Edit Desk">
                <IconButton
                  aria-label="Edit Desk"
                  onClick={() => admin.openEdit(desk)}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Desk">
                <IconButton
                  aria-label="Delete Desk"
                  onClick={() => void admin.remove(desk)}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        ))}
      {!admin.loading &&
        admin.selectedQueueId !== null &&
        admin.desks.length === 0 && (
          <Typography color="text.secondary">No desks found.</Typography>
        )}
      <Dialog
        open={admin.dialogOpen}
        onClose={admin.closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {admin.editingDesk ? "Edit Desk" : "Add Desk"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
        >
          <TextField
            autoFocus
            required
            label="Name"
            value={admin.form.name}
            onChange={(event) => admin.updateForm("name", event.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel>Queue</InputLabel>
            <Select
              label="Queue"
              value={admin.form.queueId ?? ""}
              onChange={(event) =>
                admin.updateForm(
                  "queueId",
                  event.target.value ? Number(event.target.value) : null,
                )
              }
            >
              {admin.queues.map((queue) => (
                <MenuItem key={queue.id} value={queue.id}>
                  {queue.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {admin.editingDesk && (
            <FormControlLabel
              control={
                <Switch
                  checked={admin.form.isActive}
                  onChange={(event) =>
                    admin.updateForm("isActive", event.target.checked)
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
            onClick={() => void admin.save()}
            disabled={admin.saving}
          >
            {admin.saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default AdminDesksPanel;
// Admin panel για τα desks που εξυπηρετούν queues σε επιλεγμένη location.
