// frontend/src/components/layoutComponents/Navbar.tsx

import { AppBar, Toolbar, Typography, Box, IconButton, Tooltip, Menu, MenuItem, } from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import InfoIcon from "@mui/icons-material/Info";
import SchoolIcon from "@mui/icons-material/School";

import { appName } from "../../constants/constants";

import { Link, NavLink, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";

import { UserAuthContext } from "../../authLogin/context/UserAuthContext";
import { handleLogout } from "../../authLogin/authFunctions";

const Navbar = () => {
  const { user, setUser } = useContext(UserAuthContext);
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    handleLogout(setUser, navigate);
  };

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#fffdf7",
          color: "#4a3f35",
          borderBottom: "1px solid #e5e0d8",
        }}
      >
        <Toolbar>
          {/* LOGO */}
          <Box
            component={Link}
            to="/"
            sx={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              {appName}
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* DESKTOP */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 2 }}>
            <Tooltip title="Info">
              <IconButton component={NavLink} to="/info" sx={{ color: "inherit" }}>
                <InfoIcon />
              </IconButton>
            </Tooltip>

            {user ? (
              <>
                <Tooltip title="private">
                  <IconButton
                    component={NavLink}
                    to="/private"
                    sx={{ color: "inherit" }}
                  >
                    <SchoolIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Logout">
                  <IconButton
                    onClick={handleLogoutClick}
                    sx={{ color: "inherit" }}
                  >
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Tooltip title="Login">
                <IconButton
                  component={Link}
                  to="/login"
                  sx={{ color: "inherit" }}
                >
                  <LoginIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* MOBILE HAMBURGER */}
          <Box sx={{ display: { xs: "flex", sm: "none" } }}>
            <IconButton onClick={handleMenuOpen} sx={{ color: "inherit" }}>
              <MenuIcon />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem component={NavLink} to="/info" onClick={handleMenuClose}>
                Info
              </MenuItem>

              {user && (
                <MenuItem
                  component={NavLink}
                  to="/private"
                  onClick={handleMenuClose}
                >
                  private
                </MenuItem>
              )}

              {user ? (
                <MenuItem
                  onClick={() => {
                    handleMenuClose();
                    handleLogoutClick();
                  }}
                >
                  Logout
                </MenuItem>
              ) : (
                <MenuItem
                  component={Link}
                  to="/login"
                  onClick={handleMenuClose}
                >
                  Login
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* offset για να μη σκεπάζει το fixed navbar το περιεχόμενο */}
      <Toolbar />
    </>
  );
};

export default Navbar;
