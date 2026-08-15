import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import axios from "axios";

import { UserAuthContext } from "../context/UserAuthContext";

interface Props {
  url: string;
}

const LoginBackend = ({ url }: Props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const { setUser, setIsLoading } = useContext(UserAuthContext);

  const handleSubmitBackend = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      
      const response = await axios.post(`${url}/auth/login`, {
        username,
        password,
      });

      const token = response.data.data.token;
      const user = response.data.data.user;

      localStorage.setItem("token", token);

      setUser({
        _id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        roles: [user.role],
        hasPassword: true,
        provider: "backend",
      });

      navigate("/");
    } catch {
      setErrorMessage("Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmitBackend}
      sx={{
        maxWidth: 400,
        margin: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        mt: 5,
      }}
    >
      <TextField
        label="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        fullWidth
        autoComplete="username"
      />

      <TextField
        label="Password"
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        autoComplete="current-password"
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

      {errorMessage && (
        <Typography variant="body2" color="error" align="center">
          {errorMessage}
        </Typography>
      )}

      <Button type="submit" variant="contained">
        Login
      </Button>

      <Typography variant="body2" align="center">
        Don’t have an account?{" "}
        <Link to="/register">Register</Link>
      </Typography>
    </Box>
  );
};

export default LoginBackend;