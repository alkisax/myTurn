import { Alert, Box, Button, CircularProgress } from "@mui/material";
import { useState } from "react";

import useSuperAdmin from "../hooks/useSuperAdmin";
import SuperAdminAdminsPanel from "./SuperAdminAdminsPanel";
import SuperAdminCompaniesPanel from "./SuperAdminCompaniesPanel";
import SuperAdminOverviewPanel from "./SuperAdminOverviewPanel";
import SuperAdminSidebar, { type SuperAdminPanelKey } from "./SuperAdminSidebar";

const SuperAdminLayout = () => {
  const [activePanel, setActivePanel] = useState<SuperAdminPanelKey>("overview");
  const superAdmin = useSuperAdmin();

  return (
    <Box
      component="main"
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        gap: 3,
        maxWidth: 1400,
        mx: "auto",
        p: { xs: 2, md: 3 },
      }}
    >
      <SuperAdminSidebar
        activePanel={activePanel}
        onSelect={setActivePanel}
      />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Button onClick={() => void superAdmin.loadAll()} disabled={superAdmin.loading}>
            Refresh
          </Button>
        </Box>

        {superAdmin.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {superAdmin.error}
          </Alert>
        )}

        {superAdmin.loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {activePanel === "overview" && (
              <SuperAdminOverviewPanel stats={superAdmin.stats} />
            )}
            {activePanel === "admins" && (
              <SuperAdminAdminsPanel
                admins={superAdmin.admins}
                deletingAdminId={superAdmin.deletingAdminId}
                onDelete={superAdmin.deleteAdmin}
              />
            )}
            {activePanel === "companies" && (
              <SuperAdminCompaniesPanel companies={superAdmin.companies} />
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default SuperAdminLayout;
