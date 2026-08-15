// frontend/src/authLogin/loginBackend/RegisterStaffPage.tsx

import { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";

import { backendUrl } from "../../constants/constants";
import {
  frontendValidatePassword,
  frontEndValidateEmail,
} from "../utils/registerBackend";

interface Props {
  companyId: number;
  onCreated?: () => void;
}

const RegisterStaffPage = ({
  companyId,
  onCreated,
}: Props) => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const passError = frontendValidatePassword(password);

    if (passError) {
      setErrorMessage(passError);
      setLoading(false);
      return;
    }

    if (email) {
      const emailError = frontEndValidateEmail(email);

      if (emailError) {
        setErrorMessage(emailError);
        setLoading(false);
        return;
      }
    }

    if (!username || !password || !confirmPassword) {
      setErrorMessage("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${backendUrl}/company-users/company/${companyId}/staff`,
        {
          username,
          name,
          email,
          password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Staff created for company:", companyId);

      onCreated?.();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ||
            "Failed to create staff member"
        );
      } else {
        setErrorMessage("Failed to create staff member");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, width: 400 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Add Staff Member
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            fullWidth
          />

          <TextField
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />

          <TextField
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowPassword((prev) => !prev)
                      }
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            fullWidth
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() =>
                        setShowConfirmPassword((prev) => !prev)
                      }
                      edge="end"
                    >
                      {showConfirmPassword ? (
                        <VisibilityOff />
                      ) : (
                        <Visibility />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          {errorMessage && (
            <Typography
              variant="body2"
              color="error"
              align="center"
            >
              {errorMessage}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            fullWidth
          >
            {loading ? "Creating..." : "Create Staff"}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default RegisterStaffPage;