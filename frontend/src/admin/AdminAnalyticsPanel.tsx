import {
  Box,
  Card,
  CardContent,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import useAdminAnalytics from "../hooks/adminPageHooks/useAdminAnalytics";

interface Props {
  selectedCompanyId: number | null;
}
const MetricCard = ({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) => (
  <Card>
    <CardContent>
      <Typography color="text.secondary">{label}</Typography>
      <Typography variant="h4">{value}</Typography>
    </CardContent>
  </Card>
);
const AdminAnalyticsPanel = ({ selectedCompanyId }: Props) => {
  const analytics = useAdminAnalytics(selectedCompanyId);
  if (selectedCompanyId === null)
    return <Typography>Select an organization first.</Typography>;
  if (analytics.loading) return <Typography>Loading analytics...</Typography>;
  if (analytics.error)
    return <Typography color="error">{analytics.error}</Typography>;
  if (!analytics.overview || !analytics.completion)
    return (
      <Typography color="text.secondary">
        No analytics data available.
      </Typography>
    );
  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Analytics
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Total tickets"
            value={analytics.overview.totalTickets}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Waiting"
            value={analytics.overview.waitingTickets}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Serving"
            value={analytics.overview.servingTickets}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Completed"
            value={analytics.overview.completedTickets}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard label="Missed" value={analytics.overview.missedTickets} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Expired"
            value={analytics.overview.expiredTickets}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Completion rate"
            value={`${analytics.completion.completionRate.toFixed(1)}%`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <MetricCard
            label="Active staff"
            value={analytics.overview.activeStaffCount}
          />
        </Grid>
      </Grid>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Queues
      </Typography>
      <Paper sx={{ mb: 3, overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Queue</TableCell>
              <TableCell>Tickets</TableCell>
              <TableCell>Waiting</TableCell>
              <TableCell>Serving</TableCell>
              <TableCell>Completed</TableCell>
              <TableCell>Missed</TableCell>
              <TableCell>Expired</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {analytics.queues.map((queue) => (
              <TableRow key={queue.queueId}>
                <TableCell>{queue.queueName}</TableCell>
                <TableCell>{queue.ticketCount}</TableCell>
                <TableCell>{queue.waitingCount}</TableCell>
                <TableCell>{queue.servingCount}</TableCell>
                <TableCell>{queue.completedCount}</TableCell>
                <TableCell>{queue.missedCount}</TableCell>
                <TableCell>{queue.expiredCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Locations
      </Typography>
      <Paper sx={{ mb: 3, overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Location</TableCell>
              <TableCell>Tickets</TableCell>
              <TableCell>Completed</TableCell>
              <TableCell>Missed</TableCell>
              <TableCell>Expired</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {analytics.locations.map((location) => (
              <TableRow key={location.locationId}>
                <TableCell>{location.locationName}</TableCell>
                <TableCell>{location.ticketCount}</TableCell>
                <TableCell>{location.completedCount}</TableCell>
                <TableCell>{location.missedCount}</TableCell>
                <TableCell>{location.expiredCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Staff performance
      </Typography>
      <Paper sx={{ overflowX: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Staff</TableCell>
              <TableCell>Served</TableCell>
              <TableCell>Completed</TableCell>
              <TableCell>Success</TableCell>
              <TableCell>Failed</TableCell>
              <TableCell>Missed</TableCell>
              <TableCell>Avg. service minutes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {analytics.staff.map((member) => (
              <TableRow key={member.userId}>
                <TableCell>{member.name || member.username}</TableCell>
                <TableCell>{member.totalServed}</TableCell>
                <TableCell>{member.completed}</TableCell>
                <TableCell>{member.success}</TableCell>
                <TableCell>{member.failed}</TableCell>
                <TableCell>{member.missed}</TableCell>
                <TableCell>
                  {member.averageServiceMinutes?.toFixed(1) ?? "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};
export default AdminAnalyticsPanel;
// Admin panel που εμφανίζει συνοπτικά στατιστικά tickets, queues, locations και staff.
