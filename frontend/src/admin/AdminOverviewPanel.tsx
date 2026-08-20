import { Box, Paper, Typography } from "@mui/material";
import AdminPanelInfo from "./AdminPanelInfo";
import DeleteAccountButton from "../components/DeleteAccountButton";

const sections = [
  [
    "Organizations",
    "Manage the organizations you control and their general settings.",
  ],
  [
    "Locations",
    "Add and manage the places where your organization serves customers.",
  ],
  [
    "Queues",
    "Create waiting lines, adjust how they work, and reset them when needed.",
  ],
  [
    "Services",
    "Define what customers can request and how long each service usually takes.",
  ],
  ["Desks", "Set up the service points where staff call and serve customers."],
  [
    "Staff",
    "Add staff members to your organization and remove them when needed.",
  ],
  [
    "Analytics",
    "See how tickets, queues, locations, and staff are performing.",
  ],
];
const AdminOverviewPanel = () => (
  <Box>
    <Typography variant="h5" sx={{ mb: 1 }}>
      Admin Overview
    </Typography>
    <Typography color="text.secondary" sx={{ mb: 3 }}>
      Use these sections to set up your organization and understand how it
      serves customers.
    </Typography>
    {sections.map(([title, description]) => (
      <Paper key={title} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6">{title}</Typography>
        <Typography color="text.secondary">{description}</Typography>
      </Paper>
    ))}
    <AdminPanelInfo title="Getting started">
      Select an organization from Organizations first. Then configure its
      locations, queues, services, desks, and staff.
    </AdminPanelInfo>
    <Box sx={{ mt: 6 }}>
      <DeleteAccountButton />
    </Box>
  </Box>
);
export default AdminOverviewPanel;
// Ενημερωτικό πρώτο panel που εξηγεί τον σκοπό κάθε ενότητας του Admin.
