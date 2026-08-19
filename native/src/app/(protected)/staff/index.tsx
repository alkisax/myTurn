import { useContext } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import StaffScreenLayout from "@/components/staffSetup/StaffScreenLayout";
import Step1SelectCompany from "@/components/staffSetup/staffFlowSteps/Step1SelectCompany";
import Step2SelectDesk from "@/components/staffSetup/staffFlowSteps/Step2SelectDesk";
import Step3StartSession from "@/components/staffSetup/staffFlowSteps/Step3StartSession";
import Step4StaffWorkspace from "@/components/staffSetup/staffFlowSteps/Step4StaffWorkspace";
import { ThemeContext } from "@/context/ThemeContext";
import { useStaffContext } from "@/context/useStaffContext";
import { createGlobalStyles } from "@/styles/global";
import { createStaffStyles } from "@/styles/staff.styles";

const Staff = () => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const styles = createStaffStyles(colors);
  const staff = useStaffContext();

  const renderCurrentStep = () => {
    if (staff.session && staff.selectedDesk) {
      return (
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
      );
    }

    if (!staff.selectedCompany) {
      return (
        <Step1SelectCompany
          companies={staff.companies}
          onSelectCompany={(companyId) => void staff.selectCompany(companyId)}
        />
      );
    }

    if (!staff.selectedDesk) {
      return (
        <Step2SelectDesk
          company={staff.selectedCompany}
          desks={staff.desks}
          onSelectDesk={staff.selectDesk}
          onBack={staff.backToCompanySelection}
        />
      );
    }

    return (
      <Step3StartSession
        company={staff.selectedCompany}
        desk={staff.selectedDesk}
        loading={staff.startingSession}
        errorMessage={staff.errorMessage}
        onStart={() => void staff.startSession()}
        onBack={staff.backToDeskSelection}
      />
    );
  };

  return (
    <StaffScreenLayout>
      <ScrollView
        style={globalStyles.screen}
        contentContainerStyle={styles.content}
      >
        {staff.initialLoading ? (
          <View style={globalStyles.centerContent}>
            <ActivityIndicator color={colors.primary} />
            <Text style={globalStyles.text}>Loading staff workspace...</Text>
          </View>
        ) : (
          <>
            {staff.errorMessage && !staff.session ? (
              <Text style={globalStyles.error}>{staff.errorMessage}</Text>
            ) : null}
            {renderCurrentStep()}
          </>
        )}
      </ScrollView>
    </StaffScreenLayout>
  );
};

export default Staff;
