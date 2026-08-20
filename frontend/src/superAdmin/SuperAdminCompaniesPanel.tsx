import { Box, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

import type { SuperAdminCompany } from "../hooks/useSuperAdmin";

interface Props {
  companies: SuperAdminCompany[];
}

const SuperAdminCompaniesPanel = ({ companies }: Props) => (
  <div>
    <Typography variant="h5" sx={{ mb: 1 }}>
      Companies
    </Typography>
    <Typography color="text.secondary" sx={{ mb: 3 }}>
      Review platform-wide Company associations and setup health.
    </Typography>

    {companies.length === 0 ? (
      <Typography color="text.secondary">No Companies found.</Typography>
    ) : (
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Admins</TableCell>
              <TableCell>Staff</TableCell>
              <TableCell>Locations</TableCell>
              <TableCell>Queues</TableCell>
              <TableCell>Desks</TableCell>
              <TableCell>Services</TableCell>
              <TableCell>Tickets</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companies.map((company) => (
              <TableRow key={company.id}>
                <TableCell>
                  <Typography sx={{ fontWeight: "bold" }}>{company.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {company.slug}
                  </Typography>
                </TableCell>
                <TableCell>
                  {company.admins.length === 0
                    ? "—"
                    : company.admins.map((admin) => (
                        <Typography key={admin.id} variant="body2">
                          {admin.username}
                        </Typography>
                      ))}
                </TableCell>
                <TableCell>{company.staffCount}</TableCell>
                <TableCell>{company.locationCount}</TableCell>
                <TableCell>{company.queueCount}</TableCell>
                <TableCell>{company.deskCount}</TableCell>
                <TableCell>{company.serviceCount}</TableCell>
                <TableCell>{company.ticketCount}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 0.5,
                    }}
                  >
                    {company.hasNoAdmin && <Chip size="small" label="No Admin" color="error" />}
                    {company.hasMultipleAdmins && (
                      <Chip size="small" label="Multiple Admins" color="warning" />
                    )}
                    {company.hasNoStaff && <Chip size="small" label="No Staff" />}
                    {company.hasNoLocations && <Chip size="small" label="No Locations" />}
                    {company.hasNoActiveQueues && (
                      <Chip size="small" label="No active Queues" />
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </div>
);

export default SuperAdminCompaniesPanel;
