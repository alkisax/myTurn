// frontend\src\admin\AdminSidebar.tsx
import { useState } from "react";
import {
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

import MenuIcon from "@mui/icons-material/Menu";
import BusinessIcon from "@mui/icons-material/Business";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import QueueIcon from "@mui/icons-material/Queue";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import DeskIcon from "@mui/icons-material/Desk";
import PeopleIcon from "@mui/icons-material/People";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";

interface Props {
  activePanel: string;
  onSelect: (panel: string) => void;
}

const AdminSidebar = ({ activePanel, onSelect }: Props) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (panel: string) => {
    onSelect(panel);
    setMobileOpen(false);
  };

  const drawerContent = (
    <>
      <Toolbar />

      <Divider />

      <List>
        <ListItem disablePadding>
          <ListItemButton
            selected={activePanel === "overview"}
            onClick={() => handleSelect("overview")}
          >
            <ListItemIcon>
              <DashboardOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Overview" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={activePanel === "organizations"}
            onClick={() => handleSelect("organizations")}
          >
            <ListItemIcon>
              <BusinessIcon />
            </ListItemIcon>

            <ListItemText primary="Organizations" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={activePanel === "locations"}
            onClick={() => handleSelect("locations")}
          >
            <ListItemIcon>
              <LocationOnIcon />
            </ListItemIcon>
            <ListItemText primary="Locations" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={activePanel === "queues"}
            onClick={() => handleSelect("queues")}
          >
            <ListItemIcon>
              <QueueIcon />
            </ListItemIcon>
            <ListItemText primary="Queues" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={activePanel === "services"}
            onClick={() => handleSelect("services")}
          >
            <ListItemIcon>
              <MiscellaneousServicesIcon />
            </ListItemIcon>
            <ListItemText primary="Services" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={activePanel === "desks"}
            onClick={() => handleSelect("desks")}
          >
            <ListItemIcon>
              <DeskIcon />
            </ListItemIcon>
            <ListItemText primary="Desks" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={activePanel === "staff"}
            onClick={() => handleSelect("staff")}
          >
            <ListItemIcon>
              <PeopleIcon />
            </ListItemIcon>
            <ListItemText primary="Staff" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={activePanel === "analytics"}
            onClick={() => handleSelect("analytics")}
          >
            <ListItemIcon>
              <AnalyticsIcon />
            </ListItemIcon>
            <ListItemText primary="Analytics" />
          </ListItemButton>
        </ListItem>
      </List>
    </>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          onClick={() => setMobileOpen((current) => !current)}
          sx={{
            position: "fixed",
            top: 72,
            left: 8,
            zIndex: (currentTheme) => currentTheme.zIndex.drawer + 1,
            backgroundColor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: 220,
          flexShrink: 0,

          "& .MuiDrawer-paper": {
            width: 220,
            boxSizing: "border-box",
            mt: isMobile ? 0 : "64px",
            borderRight: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.default",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default AdminSidebar;
// Πλευρική πλοήγηση μεταξύ των ενοτήτων του Admin area.
