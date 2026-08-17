import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import usePublicLocation from "../hooks/publicPageHooks/usePublicLocation";

const PublicLocation = () => {
  const { companySlug, locationSlug } = useParams<{
    companySlug: string;
    locationSlug: string;
  }>();
  const navigate = useNavigate();
  const { company, location, queues, loading, errorMessage } =
    usePublicLocation(companySlug, locationSlug);

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>Loading queues...</Typography>
      </Box>
    );
  }

  if (errorMessage || !company || !location) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5">
          {errorMessage || "Company or location not found"}
        </Typography>
        <Button
          sx={{ mt: 2 }}
          variant="outlined"
          onClick={() => navigate(`/${companySlug ?? ""}`)}
        >
          Back to locations
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 3, sm: 6 },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      <Typography variant="h4">{company.name}</Typography>
      <Typography variant="h5">{location.name}</Typography>
      {(location.address || location.country) && (
        <Typography color="text.secondary">
          {[location.address, location.country].filter(Boolean).join(", ")}
        </Typography>
      )}
      <Typography variant="h5">Choose a queue</Typography>

      <Box
        sx={{
          width: "100%",
          maxWidth: 640,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {queues.map((queue) => (
          <Card key={queue.id}>
            <CardActionArea
              onClick={() =>
                navigate(`/${companySlug}/${locationSlug}/queues/${queue.id}`)
              }
            >
              <CardContent>
                <Typography variant="h6">{queue.name}</Typography>
                {queue.description && (
                  <Typography color="text.secondary">
                    {queue.description}
                  </Typography>
                )}
              </CardContent>
            </CardActionArea>
          </Card>
        ))}

        {queues.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: "center" }}>
            No queues are currently available for remote ticketing.
          </Typography>
        )}
      </Box>

      <Button variant="outlined" onClick={() => navigate(`/${companySlug}`)}>
        Back to locations
      </Button>
    </Box>
  );
};

export default PublicLocation;
