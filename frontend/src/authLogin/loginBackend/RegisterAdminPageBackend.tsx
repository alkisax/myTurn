// frontend/src/authLogin/loginBackend/RegisterAdminPageBackend.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  frontendValidatePassword,
  frontEndValidateEmail,
} from "../utils/registerBackend";
import { Visibility, VisibilityOff } from "@mui/icons-material";

interface Props {
  url: string;
}

const RegisterAdminPageBackend = ({ url }: Props) => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const handleRegisterAdmin = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const passError = frontendValidatePassword(password);

    if (passError) {
      setErrorMessage(passError);
      setLoading(false);
      return;
    }

    const emailError = frontEndValidateEmail(email);

    if (emailError) {
      setErrorMessage(emailError);
      setLoading(false);
      return;
    }

    if (!username || !name || !email || !password || !confirmPassword) {
      setErrorMessage("Please fill in all fields");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${url}/auth/register-admin`, {
        username,
        name,
        email,
        password,
      });

      if (res.data.status) {
        alert("Admin account created successfully");
        navigate("/login");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const backendMsg =
          err.response?.data?.error ||
          err.response?.data?.message;

        setErrorMessage(
          backendMsg || "Admin registration failed"
        );
      } else {
        setErrorMessage("Admin registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, width: 400 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Create Admin Account
      </Typography>

      <Typography
        variant="body2"
        align="center"
        sx={{ mb: 3 }}
      >
        Create an admin account to add a company and use MyTurn as an admin.
      </Typography>

      <Box component="form" onSubmit={handleRegisterAdmin}>
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
            required
            fullWidth
          />

          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
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
            {loading ? "Loading..." : "Create Admin Account"}
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};

export default RegisterAdminPageBackend;