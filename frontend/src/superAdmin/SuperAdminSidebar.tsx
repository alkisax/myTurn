import { Box, Button, Stack } from "@mui/material";

export type SuperAdminPanelKey = "overview" | "admins" | "companies";

interface Props {
  activePanel: SuperAdminPanelKey;
  onSelect: (panel: SuperAdminPanelKey) => void;
}

const SuperAdminSidebar = ({ activePanel, onSelect }: Props) => {
  const items: Array<{ key: SuperAdminPanelKey; label: string }> = [
    { key: "overview", label: "Overview" },
    { key: "admins", label: "Admins" },
    { key: "companies", label: "Companies" },
  ];

  return (
    <Box
      component="nav"
      sx={{
        width: { xs: "100%", md: 190 },
        flexShrink: 0,
        mb: { xs: 2, md: 0 },
      }}
    >
      <Stack direction={{ xs: "row", md: "column" }} spacing={1}>
        {items.map((item) => (
          <Button
            key={item.key}
            variant={activePanel === item.key ? "contained" : "outlined"}
            onClick={() => onSelect(item.key)}
            sx={{ justifyContent: { md: "flex-start" } }}
          >
            {item.label}
          </Button>
        ))}
      </Stack>
    </Box>
  );
};

export default SuperAdminSidebar;
