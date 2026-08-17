// // frontend\src\dashboard\DashboardSidebar.tsx
// import { useState } from "react";
// import {
//   Drawer,
//   List,
//   ListItem,
//   ListItemButton,
//   ListItemIcon,
//   ListItemText,
//   Toolbar,
//   Divider,
//   IconButton,
//   useMediaQuery,
// } from "@mui/material";

// import MenuIcon from "@mui/icons-material/Menu";
// import PeopleIcon from "@mui/icons-material/People";

// import { useTheme } from "@mui/material/styles";

// interface Props {
//   onSelect: (panel: string) => void;
// }

// const DashboardSidebar = ({ onSelect }: Props) => {
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
//   const [mobileOpen, setMobileOpen] = useState(false);

//   const handleSelect = (panel: string) => {
//     onSelect(panel);
//     setMobileOpen(false);
//   };

//   const drawerContent = (
//     <>
//       <Toolbar />
//       <Divider />

//       <List>
//         <ListItem disablePadding>
//           <ListItemButton
//             id="dashboard-sidebar-users"
//             onClick={() => handleSelect("users")}
//           >
//             <ListItemIcon>
//               <PeopleIcon />
//             </ListItemIcon>
//             <ListItemText primary="Users" />
//           </ListItemButton>
//         </ListItem>

//       </List>
//     </>
//   );

//   return (
//     <>
//       {isMobile && (
//         <IconButton
//           onClick={() => setMobileOpen(!mobileOpen)}
//           sx={{
//             position: "fixed",
//             top: 72,
//             left: 8,
//             zIndex: (theme) => theme.zIndex.drawer + 1,
//             backgroundColor: "white",
//             border: "1px solid #ddd",
//             "&:hover": { backgroundColor: "#f0f0f0" },
//           }}
//         >
//           <MenuIcon />
//         </IconButton>
//       )}

//       <Drawer
//         variant={isMobile ? "temporary" : "permanent"}
//         open={isMobile ? mobileOpen : true}
//         onClose={() => setMobileOpen(false)}
//         sx={{
//           width: 220,
//           flexShrink: 0,
//           "& .MuiDrawer-paper": {
//             width: 220,
//             boxSizing: "border-box",
//             mt: isMobile ? 0 : "64px",
//             borderRight: "1px solid #ddd",
//             backgroundColor: "#f5f5f5",
//             boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
//           },
//         }}
//       >
//         {drawerContent}
//       </Drawer>
//     </>
//   );
// };

// export default DashboardSidebar;