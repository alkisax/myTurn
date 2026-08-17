// frontend/src/components/companySetup/CreateDeskForm.tsx

import { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";

import { backendUrl } from "../../constants/constants";


interface Props {
  locationId: number;
  queues: QueueOption[];
  onCreated?: () => void;
}

const CreateDeskForm = ({
  locationId,
  queues,
  onCreated,
}: Props) => {
  const [name, setName] = useState("");
  const [queueId, setQueueId] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!queueId) {
      setErrorMessage("Please select a queue");
      return;
    }

    setLoading(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${backendUrl}/desks`,
        {
          locationId,
          queueId: Number(queueId),
          name,
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
            "Failed to create desk"
        );
      } else {
        setErrorMessage("Failed to create desk");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, width: 400 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Create Desk
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
          label="Desk Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
        />

        <TextField
          select
          label="Queue"
          value={queueId}
          onChange={(e) => setQueueId(e.target.value)}
          required
          fullWidth
        >
          {queues.map((queue) => (
            <MenuItem
              key={queue.id}
              value={queue.id}
            >
              {queue.name}
            </MenuItem>
          ))}
        </TextField>

        {errorMessage && (
          <Typography color="error" variant="body2">
            {errorMessage}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={loading || !name.trim() || !queueId}
        >
          {loading ? "Creating..." : "Create Desk"}
        </Button>
      </Box>
    </Paper>
  );
};

export default CreateDeskForm;
import type { QueueOption } from "../../types/queue.types";
