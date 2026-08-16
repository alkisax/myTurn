// frontend/src/components/companySetup/CreateServiceForm.tsx

import { useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";

import { backendUrl } from "../../constants/constants";

interface Props {
  locationId: number;
  queues: { id: number; name: string }[];
  onCreated?: () => void;
}

const CreateServiceForm = ({
  locationId,
  queues,
  onCreated,
}: Props) => {
  const [name, setName] = useState("");
  const [queueId, setQueueId] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [estimatedServiceMinutes, setEstimatedServiceMinutes] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${backendUrl}/services`,
        {
          locationId,
          queueId,
          name,
          description: description || null,
          isGeneric: false,
          estimatedServiceMinutes:
            estimatedServiceMinutes === ""
              ? null
              : Number(estimatedServiceMinutes),
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
            "Failed to create service"
        );
      } else {
        setErrorMessage("Failed to create service");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, width: 400 }}>
      <Typography variant="h5" align="center" gutterBottom>
        Create Service
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
          label="Service Name"
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

        <TextField
          select
          label="Queue"
          value={queueId}
          onChange={(e) => setQueueId(Number(e.target.value))}
          required
          fullWidth
        >
          {queues.map((queue) => (
            <MenuItem key={queue.id} value={queue.id}>
              {queue.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Estimated Service Minutes"
          type="number"
          value={estimatedServiceMinutes}
          onChange={(e) =>
            setEstimatedServiceMinutes(e.target.value)
          }
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
          disabled={loading || !name.trim() || queueId === ""}
        >
          {loading ? "Creating..." : "Create Service"}
        </Button>
      </Box>
    </Paper>
  );
};

export default CreateServiceForm;
