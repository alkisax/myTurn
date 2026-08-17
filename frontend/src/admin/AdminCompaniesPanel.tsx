import { Add, Delete, Edit, InfoOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { QRCodeSVG } from "qrcode.react";
import useAdminCompanies from "../hooks/adminPageHooks/useAdminCompanies";
import { colors } from "../constants/constants";
import AdminPanelInfo from "./AdminPanelInfo";

interface Props {
  selectedCompanyId: number | null;
  onSelectCompany: (companyId: number) => void;
}

const AdminCompaniesPanel = ({ selectedCompanyId, onSelectCompany }: Props) => {
  const admin = useAdminCompanies();

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <AdminPanelInfo title="About Organizations">
        An organization is the business or group that owns your MyTurn setup,
        including its locations, queues, services, desks, staff, and tickets.
        Default estimated service minutes are used when a ticket has no selected
        service, while missed ticket expiry minutes control when missed tickets
        can expire. The QR code opens the public organization link where
        customers choose a location and request a ticket; you can find it in
        Organization Info.
      </AdminPanelInfo>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5">Organizations</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={admin.openCreate}
        >
          Add Organization
        </Button>
      </Box>

      {admin.errorMessage && (
        <Typography color="error" sx={{ mb: 2 }}>
          {admin.errorMessage}
        </Typography>
      )}
      {admin.loading && <Typography>Loading organizations...</Typography>}

      {!admin.loading &&
        admin.companies.map((company) => (
          <Paper
            key={company.id}
            onClick={() => onSelectCompany(company.id)}
            sx={{
              p: 2,
              mb: 2,
              cursor: "pointer",
              backgroundColor:
                selectedCompanyId === company.id
                  ? colors.selectedOrganization
                  : undefined,
              color: selectedCompanyId === company.id ? "#332b00" : undefined,
              border:
                selectedCompanyId === company.id
                  ? "2px solid"
                  : "1px solid transparent",
              borderColor:
                selectedCompanyId === company.id ? "#c5a900" : "transparent",
            }}
          >
            <Box
              sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
            >
              <Box>
                <Typography variant="h6">{company.name}</Typography>
                <Typography color="text.secondary">
                  Slug: {company.slug}
                </Typography>
                <Typography>
                  Default service minutes:{" "}
                  {company.defaultEstimatedServiceMinutes}
                </Typography>
                <Typography>
                  Missed ticket expiry minutes:{" "}
                  {company.missedTicketExpiryMinutes}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                <Tooltip title="Organization Info">
                  <IconButton
                    aria-label="Organization Info"
                    onClick={() => admin.openInfo(company)}
                  >
                    <InfoOutlined />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Edit Organization">
                  <IconButton
                    aria-label="Edit organization"
                    onClick={() => admin.openEdit(company)}
                  >
                    <Edit />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete Organization">
                  <IconButton
                    aria-label="Delete organization"
                    onClick={() => void admin.deleteCompany(company)}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Paper>
        ))}

      {!admin.loading && admin.companies.length === 0 && (
        <Typography color="text.secondary">No organizations found.</Typography>
      )}

      <Dialog
        open={admin.dialogOpen}
        onClose={admin.closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {admin.editingCompany ? "Edit Organization" : "Add Organization"}
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}
        >
          <TextField
            autoFocus
            label="Name"
            required
            value={admin.form.name}
            onChange={(event) => admin.updateForm("name", event.target.value)}
            fullWidth
          />
          <TextField
            label="Missed ticket expiry minutes"
            type="number"
            required
            value={admin.form.missedTicketExpiryMinutes}
            onChange={(event) =>
              admin.updateForm("missedTicketExpiryMinutes", event.target.value)
            }
            fullWidth
          />
          <TextField
            label="Default estimated service minutes"
            type="number"
            required
            value={admin.form.defaultEstimatedServiceMinutes}
            onChange={(event) =>
              admin.updateForm(
                "defaultEstimatedServiceMinutes",
                event.target.value,
              )
            }
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={admin.closeDialog} disabled={admin.saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => void admin.saveCompany()}
            disabled={admin.saving}
          >
            {admin.saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={admin.infoCompany !== null}
        onClose={admin.closeInfo}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Organization Info</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 1, pt: 2 }}
        >
          {admin.infoCompany && (
            <>
              <Typography variant="h6">{admin.infoCompany.name}</Typography>
              <Typography>Slug: {admin.infoCompany.slug}</Typography>
              <Typography>
                Default service minutes:{" "}
                {admin.infoCompany.defaultEstimatedServiceMinutes}
              </Typography>
              <Typography>
                Missed ticket expiry minutes:{" "}
                {admin.infoCompany.missedTicketExpiryMinutes}
              </Typography>
              <Typography sx={{ wordBreak: "break-word" }}>
                Public URL: {window.location.origin}/{admin.infoCompany.slug}
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <QRCodeSVG
                  value={`${window.location.origin}/${admin.infoCompany.slug}`}
                  size={200}
                />
              </Box>
              <Button
                variant="outlined"
                onClick={() => void admin.copyPublicLink()}
              >
                Copy public link
              </Button>
              {admin.copyMessage && (
                <Typography
                  color={
                    admin.copyMessage.startsWith("Could")
                      ? "error"
                      : "success.main"
                  }
                >
                  {admin.copyMessage}
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={admin.closeInfo}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminCompaniesPanel;
// Admin panel για δημιουργία, επεξεργασία και διαχείριση organizations.
