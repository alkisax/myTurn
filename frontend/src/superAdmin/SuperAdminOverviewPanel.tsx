import { Box, Card, CardContent, Stack, Typography } from "@mui/material";

import type { SuperAdminStats } from "../hooks/useSuperAdmin";

interface Props {
  stats: SuperAdminStats | null;
}

const SuperAdminOverviewPanel = ({ stats }: Props) => {
  if (!stats) {
    return <Typography color="text.secondary">No statistics found.</Typography>;
  }

  const totals = [
    ["Companies", stats.companies],
    ["Admins", stats.adminUsers],
    ["Staff", stats.staffUsers],
    ["Locations", stats.locations],
    ["Queues", stats.queues],
    ["Desks", stats.desks],
    ["Services", stats.services],
    ["Tickets", stats.tickets],
    ["Staff Sessions", stats.staffSessions],
  ] as const;

  const integrity = [
    ["Companies without Admin", stats.companiesWithoutAdmin],
    ["Companies with multiple Admins", stats.companiesWithMultipleAdmins],
    ["Companies without Staff", stats.companiesWithoutStaff],
    ["Companies without Locations", stats.companiesWithoutLocations],
    ["Companies without active Queues", stats.companiesWithoutActiveQueues],
  ] as const;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5">SuperAdmin Overview</Typography>
        <Typography color="text.secondary">
          A global view of the MyTurn platform.
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "repeat(2, minmax(0, 1fr))",
            sm: "repeat(3, minmax(0, 1fr))",
          },
          gap: 2,
        }}
      >
        {totals.map(([label, value]) => (
          <Card key={label} variant="outlined">
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                {label}
              </Typography>
              <Typography variant="h4">{value}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Platform health
        </Typography>
        <Stack spacing={1}>
          {integrity.map(([label, value]) => (
            <Card key={label} variant="outlined">
              <CardContent
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 2,
                  py: 1.5,
                  "&:last-child": { pb: 1.5 },
                }}
              >
                <Typography>{label}</Typography>
                <Typography sx={{ fontWeight: "bold" }}>{value}</Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
};

export default SuperAdminOverviewPanel;
