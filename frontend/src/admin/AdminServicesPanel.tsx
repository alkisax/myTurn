import { Delete, Edit, MiscellaneousServices } from "@mui/icons-material";
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
import useAdminServices from "../hooks/adminPageHooks/useAdminServices";
import { colors } from "../constants/constants";
import AdminPanelInfo from "./AdminPanelInfo";

interface Props {
  selectedCompanyId: number | null;
}
const AdminServicesPanel = ({ selectedCompanyId }: Props) => {
  const admin = useAdminServices(selectedCompanyId);
  if (selectedCompanyId === null)
    return <Typography>Select an organization first.</Typography>;
  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <AdminPanelInfo title="About Services">
        A service is a specific thing customers can request from a queue, such
        as Cheese, Ham, or Fresh meat. Its estimated service minutes help MyTurn
        calculate waiting times. Services belong to one queue, can be marked
        active or inactive, and may be generic when they represent a general
        request without a specific service choice.
      </AdminPanelInfo>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">Services</Typography>
        {admin.selectedQueueId !== null && (
          <Button
            variant="contained"
            startIcon={<MiscellaneousServices />}
            onClick={admin.openCreate}
          >
            Add Service
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
            sx={{
              backgroundColor: colors.adminSelectorBackground,
              color: "#222",
              "& .MuiSvgIcon-root": { color: "#222" },
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
            sx={{
              backgroundColor: colors.adminSelectorBackground,
              color: "#222",
              "& .MuiSvgIcon-root": { color: "#222" },
            }}
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
        <Typography>Select a location to manage its services.</Typography>
      )}
      {admin.selectedLocationId !== null &&
        admin.queues.length === 0 &&
        !admin.queuesLoading && (
          <Typography>No queues found for this location.</Typography>
        )}
      {admin.selectedQueueId === null && admin.queues.length > 0 && (
        <Typography>Select a queue to manage its services.</Typography>
      )}
      {admin.loading && <Typography>Loading services...</Typography>}
      {!admin.loading &&
        admin.selectedQueueId !== null &&
        admin.services.map((service) => (
          <Paper
            key={service.id}
            sx={{
              p: 2,
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="h6">{service.name}</Typography>
              <Typography>
                Queue:{" "}
                {admin.queues.find((queue) => queue.id === service.queueId)
                  ?.name ?? "-"}
              </Typography>
              <Typography>{service.description || "No description"}</Typography>
              <Typography>
                Minutes: {service.estimatedServiceMinutes ?? "Not set"} ·
                Status: {service.isActive ? "Active" : "Inactive"} ·{" "}
                {service.isGeneric ? "Generic" : "Specific"}
              </Typography>
            </Box>
            <Box>
              <Tooltip title="Edit Service">
                <IconButton
                  aria-label="Edit Service"
                  onClick={() => admin.openEdit(service)}
                >
                  <Edit />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete Service">
                <IconButton
                  aria-label="Delete Service"
                  onClick={() => void admin.remove(service)}
                >
                  <Delete />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>
        ))}
      {!admin.loading &&
        admin.selectedQueueId !== null &&
        admin.services.length === 0 && (
          <Typography color="text.secondary">No services found.</Typography>
        )}
      <Dialog
        open={admin.dialogOpen}
        onClose={admin.closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {admin.editingService ? "Edit Service" : "Add Service"}
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
          <TextField
            label="Description"
            value={admin.form.description}
            onChange={(event) =>
              admin.updateForm("description", event.target.value)
            }
          />
          <TextField
            label="Estimated service minutes"
            type="number"
            value={admin.form.estimatedServiceMinutes}
            onChange={(event) =>
              admin.updateForm("estimatedServiceMinutes", event.target.value)
            }
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
          <FormControlLabel
            control={
              <Switch
                checked={admin.form.isGeneric}
                onChange={(event) =>
                  admin.updateForm("isGeneric", event.target.checked)
                }
              />
            }
            label="Generic service"
          />
          {admin.editingService && (
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
export default AdminServicesPanel;
// Admin panel για services που ανήκουν στην επιλεγμένη queue.
