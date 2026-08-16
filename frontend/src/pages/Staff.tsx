import { Box, Typography } from "@mui/material";
import Step1SelectCompany from "../components/staffSetup/staffFlowSteps/Step1SelectCompany";
import Step2SelectDesk from "../components/staffSetup/staffFlowSteps/Step2SelectDesk";
import Step3StartSession from "../components/staffSetup/staffFlowSteps/Step3StartSession";
import Step4StaffWorkspace from "../components/staffSetup/staffFlowSteps/Step4StaffWorkspace";
import { useStaffContext } from "../context/useStaffContext";

const Staff = () => {
  const staff = useStaffContext();
  const company = staff.selectedCompany;

  if (staff.session && staff.selectedDesk) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          p: 4,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Step4StaffWorkspace
          desk={staff.selectedDesk}
          session={staff.session}
          waitingTickets={staff.waitingTickets}
          servingTickets={staff.servingTickets}
          missedTickets={staff.missedTickets}
          waitingCount={staff.waitingCount}
          servingCount={staff.servingCount}
          missedCount={staff.missedCount}
          totalTickets={staff.totalTickets}
          nextWaitingTicket={staff.nextWaitingTicket}
          currentTicket={staff.currentTicket}
          loading={staff.workspaceLoading}
          errorMessage={staff.errorMessage}
          onNext={() => void staff.nextCustomer()}
          onComplete={() => void staff.completeTicket()}
          onMissed={() => void staff.markMissed()}
          onRecall={(ticketId) => void staff.recallTicket(ticketId)}
          onToggleBreak={() => void staff.toggleBreak()}
          onEndShift={() => void staff.endShift()}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      <Typography variant="h4">Staff Workspace</Typography>

      {!company && (
        <Step1SelectCompany
          companies={staff.companies}
          onSelectCompany={(companyId) => void staff.selectCompany(companyId)}
        />
      )}

      {company && !staff.selectedDesk && (
        <Step2SelectDesk
          company={company}
          desks={staff.desks}
          onSelectDesk={staff.selectDesk}
          onBack={staff.backToCompanySelection}
        />
      )}

      {company && staff.selectedDesk && (
        <Step3StartSession
          company={company}
          desk={staff.selectedDesk}
          loading={staff.startingSession}
          errorMessage={staff.errorMessage}
          onStart={() => void staff.startSession()}
          onBack={staff.backToDeskSelection}
        />
      )}
    </Box>
  );
};

export default Staff;
