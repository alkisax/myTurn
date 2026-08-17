import {
  Delete,
  Edit,
  Queue as QueueIcon,
  RestartAlt,
} from "@mui/icons-material";
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
import useAdminQueues from "../hooks/adminPageHooks/useAdminQueues";
import { colors } from "../constants/constants";
import AdminPanelInfo from "./AdminPanelInfo";

interface Props {
  selectedCompanyId: number | null;
}
const AdminQueuesPanel = ({ selectedCompanyId }: Props) => {
  const admin = useAdminQueues(selectedCompanyId);
  if (selectedCompanyId === null)
    return <Typography>Select an organization first.</Typography>;
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <AdminPanelInfo title="About Queues">
        A queue is a separate waiting line for a type of customer service, such
        as Deli or Butcher. Opening and closing times control when the queue
        serves customers. Reset times define when its daily ticket numbering and
        queue cycle reset. Automatic reset performs that reset for you according
        to the schedule; you can also reset a queue manually when needed.
      </AdminPanelInfo>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">Queues</Typography>
        {admin.selectedLocationId !== null && (
          <Button
            variant="contained"
            startIcon={<QueueIcon />}
            onClick={admin.openCreate}
          >
            Add Queue
          </Button>
        )}
      </Box>
      {admin.locationsLoading && <Typography>Loading locations...</Typography>}
      {!admin.locationsLoading && admin.locations.length === 0 && (
        <Typography>No locations found for this organization.</Typography>
      )}
      {admin.locations.length > 0 && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel
            id="admin-queue-location-label"
            sx={{ color: "#332b00", "&.Mui-focused": { color: "#332b00" } }}
          >
            Location
          </InputLabel>
          <Select
            labelId="admin-queue-location-label"
            label="Location"
            value={admin.selectedLocationId ?? ""}
            onChange={(event) =>
              admin.setSelectedLocationId(
                event.target.value ? Number(event.target.value) : null,
              )
            }
            sx={{
              color: "#332b00",
              backgroundColor: colors.adminSelectorBackground,
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#332b00" },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#332b00",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#332b00",
              },
              "& .MuiSvgIcon-root": { color: "#332b00" },
            }}
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
      {admin.errorMessage && (
        <Typography color="error" sx={{ mb: 2 }}>
          {admin.errorMessage}
        </Typography>
      )}
      {admin.selectedLocationId === null && admin.locations.length > 0 && (
        <Typography>Select a location to manage its queues.</Typography>
      )}
      {admin.loading && <Typography>Loading queues...</Typography>}
      {!admin.loading &&
        admin.selectedLocationId !== null &&
        admin.queues.map((queue) => (
          <Paper key={queue.id} sx={{ p: 2, mb: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
            >
              <Box>
                <Typography variant="h6">{queue.name}</Typography>
                <Typography>{queue.description || "No description"}</Typography>
                <Typography>
                  Status: {queue.isActive ? "Active" : "Inactive"} · Remote:{" "}
                  {queue.isRemoteTicketingAllowed ? "Allowed" : "Disabled"}
                </Typography>
                <Typography>
                  Service minutes: {queue.defaultServiceMinutes ?? "Not set"} ·
                  Max waiting: {queue.maxWaitingTickets ?? "Not set"}
                </Typography>
                <Typography>
                  Hours: {queue.opensAt ?? "-"} – {queue.closesAt ?? "-"} ·
                  Reset:{" "}
                  {queue.autoResetEnabled
                    ? (queue.resetAt ?? "Automatic")
                    : "Disabled"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                <Tooltip title="Edit Queue">
                  <IconButton
                    aria-label="Edit Queue"
                    onClick={() => admin.openEdit(queue)}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reset Queue">
                  <IconButton
                    aria-label="Reset Queue"
                    onClick={() => void admin.resetQueue(queue)}
                  >
                    <RestartAlt />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Queue">
                  <IconButton
                    aria-label="Delete Queue"
                    onClick={() => void admin.deleteQueue(queue)}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Paper>
        ))}
      {!admin.loading &&
        admin.selectedLocationId !== null &&
        admin.queues.length === 0 && (
          <Typography color="text.secondary">No queues found.</Typography>
        )}
      <Dialog
        open={admin.dialogOpen}
        onClose={admin.closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {admin.editingQueue ? "Edit Queue" : "Add Queue"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
        >
          <TextField
            autoFocus
            required
            label="Name"
            value={admin.form.name}
            onChange={(e) => admin.updateForm("name", e.target.value)}
            fullWidth
          />
          <TextField
            label="Description"
            value={admin.form.description}
            onChange={(e) => admin.updateForm("description", e.target.value)}
            fullWidth
          />
          <TextField
            label="Default service minutes"
            type="number"
            value={admin.form.defaultServiceMinutes}
            onChange={(e) =>
              admin.updateForm("defaultServiceMinutes", e.target.value)
            }
            fullWidth
          />
          <TextField
            label="Max waiting tickets"
            type="number"
            value={admin.form.maxWaitingTickets}
            onChange={(e) =>
              admin.updateForm("maxWaitingTickets", e.target.value)
            }
            fullWidth
          />
          <TextField
            label="Opens at"
            type="time"
            value={admin.form.opensAt}
            onChange={(e) => admin.updateForm("opensAt", e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <TextField
            label="Closes at"
            type="time"
            value={admin.form.closesAt}
            onChange={(e) => admin.updateForm("closesAt", e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <TextField
            label="Reset at"
            type="time"
            value={admin.form.resetAt}
            onChange={(e) => admin.updateForm("resetAt", e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <FormControlLabel
            control={
              <Switch
                checked={admin.form.autoResetEnabled}
                onChange={(e) =>
                  admin.updateForm("autoResetEnabled", e.target.checked)
                }
              />
            }
            label="Automatic reset"
          />
          {admin.editingQueue && (
            <>
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
              <FormControlLabel
                control={
                  <Switch
                    checked={admin.form.isRemoteTicketingAllowed}
                    onChange={(e) =>
                      admin.updateForm(
                        "isRemoteTicketingAllowed",
                        e.target.checked,
                      )
                    }
                  />
                }
                label="Remote ticketing allowed"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={admin.form.resetNumberDaily}
                    onChange={(e) =>
                      admin.updateForm("resetNumberDaily", e.target.checked)
                    }
                  />
                }
                label="Reset number daily"
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={admin.closeDialog} disabled={admin.saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void admin.saveQueue()}
            disabled={admin.saving}
          >
            {admin.saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
export default AdminQueuesPanel;
// Admin panel για δημιουργία και ρύθμιση queues σε επιλεγμένη location.
