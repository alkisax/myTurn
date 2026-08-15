// frontend/src/components/companySetup/CreateQueueForm.tsx

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
  locationId: number;
  onCreated?: () => void;
}

const CreateQueueForm = ({
  locationId,
  onCreated,
}: Props) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${backendUrl}/queues`,
        {
          locationId,
          name,
          description: description || null,
          defaultServiceMinutes: null,
          maxWaitingTickets: null,
          opensAt: null,
          closesAt: null,
          autoResetEnabled: false,
          resetAt: null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onCreated?.();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(
          error.response?.data?.message ||
            "Failed to create queue"
        );
      } else {
        setErrorMessage("Failed to create queue");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, width: 400 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Create Queue
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
          label="Queue Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
        />

        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
          {loading ? "Creating..." : "Create Queue"}
        </Button>
      </Box>
    </Paper>
  );
};

export default CreateQueueForm;