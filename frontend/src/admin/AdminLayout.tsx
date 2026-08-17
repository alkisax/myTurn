// frontend\src\admin\AdminLayout.tsx

import { useState } from "react";
import { Box } from "@mui/material";

import AdminSidebar from "./AdminSidebar";
import AdminCompaniesPanel from "./AdminCompaniesPanel";
import AdminLocationsPanel from "./AdminLocationsPanel";
import AdminQueuesPanel from "./AdminQueuesPanel";
import AdminServicesPanel from "./AdminServicesPanel";
import AdminDesksPanel from "./AdminDesksPanel";
import AdminStaffPanel from "./AdminStaffPanel";
import AdminAnalyticsPanel from "./AdminAnalyticsPanel";
import AdminOverviewPanel from "./AdminOverviewPanel";

const AdminLayout = () => {
  const [activePanel, setActivePanel] = useState("overview");
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null,
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <AdminSidebar activePanel={activePanel} onSelect={setActivePanel} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          ml: { sm: 1 },
          maxWidth: 1200,
        }}
      >
        {activePanel === "overview" && <AdminOverviewPanel />}
        {activePanel === "organizations" && (
          <AdminCompaniesPanel
            selectedCompanyId={selectedCompanyId}
            onSelectCompany={setSelectedCompanyId}
          />
        )}
        {activePanel === "locations" && (
          <AdminLocationsPanel selectedCompanyId={selectedCompanyId} />
        )}
        {activePanel === "queues" && (
          <AdminQueuesPanel selectedCompanyId={selectedCompanyId} />
        )}
        {activePanel === "services" && (
          <AdminServicesPanel selectedCompanyId={selectedCompanyId} />
        )}
        {activePanel === "desks" && (
          <AdminDesksPanel selectedCompanyId={selectedCompanyId} />
        )}
        {activePanel === "staff" && (
          <AdminStaffPanel selectedCompanyId={selectedCompanyId} />
        )}
        {activePanel === "analytics" && (
          <AdminAnalyticsPanel selectedCompanyId={selectedCompanyId} />
        )}
      </Box>
    </Box>
  );
};

export default AdminLayout;
// Κεντρικό layout του Admin: κρατά το ενεργό panel και την επιλεγμένη organization.
