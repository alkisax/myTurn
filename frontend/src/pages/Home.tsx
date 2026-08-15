// frontend\src\pages\Home.tsx

import { Box } from "@mui/material"
import CompanyWizardCard from "../components/companySetup/CompanyWizardCard"

const Home = () => {
  return (
    <>
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f5f5f5",
          p: 2,
          gap: 3,
        }}
      >
        {/* ADD COMPANY */}
        <CompanyWizardCard />
        <div>Home</div>

      </Box>
    </>
  )
}

export default Home