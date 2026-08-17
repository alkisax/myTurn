import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import usePublicCompany from "../hooks/publicPageHooks/usePublicCompany";

const PublicCompany = () => {
  const { companySlug } = useParams<{ companySlug: string }>();
  const navigate = useNavigate();
  const { company, locations, loading, errorMessage } =
    usePublicCompany(companySlug);

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>Loading locations...</Typography>
      </Box>
    );
  }

  if (errorMessage || !company) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5">
          {errorMessage || "Company not found"}
        </Typography>
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
      <Typography variant="h3">{company.name}</Typography>
      <Typography variant="h5">Choose a location</Typography>

      <Box
        sx={{
          width: "100%",
          maxWidth: 640,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        {locations.map((location) => (
          <Card key={location.id}>
            <CardActionArea
              onClick={() => navigate(`/${companySlug}/${location.slug}`)}
            >
              <CardContent>
                <Typography variant="h6">{location.name}</Typography>
                {(location.address || location.country) && (
                  <Typography color="text.secondary">
                    {[location.address, location.country]
                      .filter(Boolean)
                      .join(", ")}
                  </Typography>
                )}
              </CardContent>
            </CardActionArea>
          </Card>
        ))}

        {locations.length === 0 && (
          <Typography color="text.secondary" sx={{ textAlign: "center" }}>
            No active locations are available.
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default PublicCompany;
