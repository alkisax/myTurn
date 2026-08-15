// frontend/src/components/companySetup/CreateLocationForm.tsx

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
  companyId: number;
  onCreated?: () => void;
}

const CreateLocationForm = ({
  companyId,
  onCreated,
}: Props) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [timeZoneId, setTimeZoneId] = useState("Europe/Athens");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoading(true);
    setErrorMessage("");

    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${backendUrl}/locations`,
        {
          companyId,
          name,
          address: address || null,
          country: country || null,
          latitude:
            latitude === ""
              ? null
              : Number(latitude),
          longitude:
            longitude === ""
              ? null
              : Number(longitude),
          timeZoneId: timeZoneId || null,
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
            "Failed to create location"
        );
      } else {
        setErrorMessage("Failed to create location");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, width: 400 }}>
      <Typography
        variant="h5"
        align="center"
        gutterBottom
      >
        Create Location
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
          label="Location Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          fullWidth
        />

        <TextField
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          fullWidth
        />

        <TextField
          label="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          fullWidth
        />

        <TextField
          label="Latitude"
          type="number"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          fullWidth
          slotProps={{
            htmlInput: {
              step: "any",
            },
          }}
        />

        <TextField
          label="Longitude"
          type="number"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          fullWidth
          slotProps={{
            htmlInput: {
              step: "any",
            },
          }}
        />

        <TextField
          label="Time Zone"
          value={timeZoneId}
          onChange={(e) => setTimeZoneId(e.target.value)}
          fullWidth
          helperText="Example: Europe/Athens"
        />

        {errorMessage && (
          <Typography
            color="error"
            variant="body2"
          >
            {errorMessage}
          </Typography>
        )}

        <Button
          type="submit"
          variant="contained"
          disabled={loading || !name.trim()}
        >
          {loading
            ? "Creating..."
            : "Create Location"}
        </Button>
      </Box>
    </Paper>
  );
};

export default CreateLocationForm;