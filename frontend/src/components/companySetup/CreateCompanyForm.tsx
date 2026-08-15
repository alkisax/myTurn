// frontend/src/components/companySetup/CreateCompanyForm.tsx

import { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import { backendUrl } from "../../constants/constants";

interface Props {
  onCreated?: () => void;
}

const CreateCompanyForm = ({ onCreated }: Props) => {
  const [name, setName] = useState("");
  const [missedTicketExpiryMinutes, setMissedTicketExpiryMinutes] =
    useState(10);
  const [defaultEstimatedServiceMinutes, setDefaultEstimatedServiceMinutes] =
    useState(5);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${backendUrl}/companies`,
        {
          name,
          missedTicketExpiryMinutes,
          defaultEstimatedServiceMinutes,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onCreated?.();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMessage(
          err.response?.data?.message ||
            "Failed to create company"
        );
      } else {
        setErrorMessage("Failed to create company");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, width: 400 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Create Company
      </Typography>

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <TextField
          label="Company Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
        />

        <TextField
          label="Missed Ticket Expiry (minutes)"
          type="number"
          value={missedTicketExpiryMinutes}
          onChange={(e) =>
            setMissedTicketExpiryMinutes(Number(e.target.value))
          }
          required
          fullWidth
        />

        <TextField
          label="Default Service Time (minutes)"
          type="number"
          value={defaultEstimatedServiceMinutes}
          onChange={(e) =>
            setDefaultEstimatedServiceMinutes(Number(e.target.value))
          }
          required
          fullWidth
        />

        {errorMessage && (
          <Typography color="error" variant="body2">
            {errorMessage}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={loading || !name.trim()}
        >
          {loading ? "Creating..." : "Create Company"}
        </Button>
      </Box>
    </Paper>
  );
};

export default CreateCompanyForm;