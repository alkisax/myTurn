// frontend/src/pages/Home.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        // justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        p: 2,
        gap: 4,
      }}
    >
      <Typography variant="h3">
        MyTurn
      </Typography>

      <Typography
        sx={{ width: 300 }}
      >
        MyTurn is a digital queue management system for customers, staff, and organizations.
      </Typography>

      <Typography>
        Choose how you want to use MyTurn.
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
          alignItems: "center",
        }}
      >
        {/* CUSTOMER */}
        {/* <Card
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
                Get a queue ticket and follow your turn.
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card> */}

        {/* STAFF */}
        <Card
          sx={{
            width: 320,
            minHeight: 200,
          }}
        >
          <CardActionArea
            sx={{ height: "100%" }}
            onClick={() => navigate("/staff")}
          >
            <CardContent
              sx={{
                minHeight: 200,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center"
              }}
            >
              <Typography
                variant="h5"
                gutterBottom
              >
                Enter as Staff
              </Typography>

              <Typography color="text.secondary">
                Choose your workplace and desk,
                then start serving customers.
              </Typography>
            </CardContent>
          </CardActionArea>
        </Card>

        <Typography
          sx={{
            mt: 6,
            width: 300
          }}
          color="text.secondary">
          Start from Here. Set up an organization, add locations and waiting queues, define services, and assign staff to serve customers.
        </Typography>

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
            <CardContent
              sx={{
                minHeight: 200,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center"
              }}
            >
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
            Use the link provided by the organization
            to get your ticket.
          </Typography>
        </Box>
      )}

      {view === "organization" && (
        <CompanyWizardCard />
      )}
    </Box>
  );
};

export default Home;
