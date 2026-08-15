// frontend/src/pages/Home.tsx

import { useState } from "react";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from "@mui/material";

import CompanyWizardCard from "../components/companySetup/CompanyWizardCard";

type HomeView =
  | "customer"
  | "organization"
  | null;

const Home = () => {
  const [view, setView] = useState<HomeView>(null);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        p: 2,
        gap: 4,
      }}
    >
      <Typography variant="h3">
        MyTurn
      </Typography>

      <Typography>
        Choose how you want to use MyTurn.
      </Typography>

      <Box
        sx={{
          display: "flex",
          gap: 3,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {/* CUSTOMER */}
        <Card
          sx={{
            width: 320,
            minHeight: 200,
          }}
        >
          <CardActionArea
            sx={{ height: "100%" }}
            onClick={() => setView("customer")}
          >
            <CardContent>
              <Typography
                variant="h5"
                gutterBottom
              >
                Enter as Customer
              </Typography>

              <Typography color="text.secondary">
                Find an organization, choose a service
                and get your queue ticket.
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>

        {/* ORGANIZATION */}
        <Card
          sx={{
            width: 320,
            minHeight: 200,
          }}
        >
          <CardActionArea
            sx={{ height: "100%" }}
            onClick={() => setView("organization")}
          >
            <CardContent>
              <Typography
                variant="h5"
                gutterBottom
              >
                Manage an Organization
              </Typography>

              <Typography color="text.secondary">
                Set up your company, locations,
                staff, queues, services and desks.
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>
      </Box>

      {/* CUSTOMER VIEW */}
      {view === "customer" && (
        <Box
          sx={{
            width: "100%",
            maxWidth: 700,
            textAlign: "center",
          }}
        >
          <Typography variant="h5">
            Customer View
          </Typography>

          <Typography color="text.secondary">
            Company and location discovery will
            appear here.
          </Typography>
        </Box>
      )}

      {/* ORGANIZATION VIEW */}
      {view === "organization" && (
        <CompanyWizardCard />
      )}
    </Box>
  );
};

export default Home;