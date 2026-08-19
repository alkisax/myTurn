import { useContext, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { UserAuthContext } from "@/authLogin/context/UserAuthContext";
import { ThemeContext } from "@/context/ThemeContext";
import { useRoomContext } from "@/context/RoomContext";
import Navbar from "@/layout/Navbar";
import { createGlobalStyles } from "@/styles/global";
import useCompanyWizard from "@/hooks/companySetupHooks/useCompanyWizard";
import useCompanySetupActions from "@/hooks/companySetupHooks/useCompanySetupActions";
import useLocationSetupActions from "@/hooks/companySetupHooks/useLocationSetupActions";
import type {
  CompanySummary,
  LocationSummary,
} from "@/types/companySetup.types";
import {
  CreateCompanyForm,
  CreateDeskForm,
  CreateLocationForm,
  CreateQueueForm,
  CreateServiceForm,
  RegisterAdminForm,
  RegisterStaffForm,
} from "@/components/companySetup/CompanySetupForms";

const CompanyWizard = () => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const router = useRouter();
  const { user, isLoading } = useContext(UserAuthContext);
  const isAdmin = Boolean(
    user?.roles.includes("ADMIN") || user?.roles.includes("SUPERADMIN"),
  );
  const wizard = useCompanyWizard(isAdmin);

  if (isLoading || (isAdmin && wizard.companyLoading)) {
    return <Text style={globalStyles.text}>Loading...</Text>;
  }

  if (!user) {
    return (
      <WizardLayout>
        <Text style={globalStyles.title}>
          Step 1 - Create your admin account
        </Text>
        <Text style={[globalStyles.text, styles.description]}>
          MyTurn helps you organize your company as Company → Locations → Queues
          → Desks. Staff belong to the company and serve customers at desks,
          while services describe what customers can request.
        </Text>
        <Text style={[globalStyles.text, styles.description]}>
          Customers receive tickets for a queue and may optionally choose
          services. This wizard will guide you through the setup step by step.
        </Text>
        <RegisterAdminForm onCreated={() => router.replace("/login")} />
      </WizardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <WizardLayout>
        <Text style={globalStyles.title}>Company Wizard</Text>
        <Text style={globalStyles.text}>
          You are currently logged in as {user.roles[0]}.
        </Text>
        <Text style={[globalStyles.text, styles.description]}>
          You need an ADMIN account to create and manage a company.
        </Text>
      </WizardLayout>
    );
  }

  const handleCompanyCreated = () => {
    wizard.setShowCompanyForm(false);
    void wizard.fetchCompanies();
  };

  if (wizard.companies.length === 0) {
    return (
      <WizardLayout>
        <Text style={globalStyles.title}>
          Step 2 - Create your first company
        </Text>
        <Text style={[globalStyles.text, styles.description]}>
          A company is the main organization you manage in MyTurn. Your
          locations, staff, queues, desks, and services will be set up under
          this company.
        </Text>
        <Text style={[globalStyles.text, styles.description]}>
          You&apos;ll also choose how long an unclaimed ticket stays available
          and the usual time needed to serve a customer.
        </Text>
        <ActionButton
          title="Create a new company"
          onPress={() => wizard.setShowCompanyForm(true)}
        />
        {wizard.showCompanyForm && (
          <CreateCompanyForm onCreated={handleCompanyCreated} />
        )}
      </WizardLayout>
    );
  }

  if (wizard.selectedCompanyId !== null) {
    const company = wizard.companies.find(
      (item) => item.id === wizard.selectedCompanyId,
    );

    if (company && wizard.selectedLocation) {
      return (
        <LocationActions
          company={company}
          location={wizard.selectedLocation}
          onBack={() => wizard.setSelectedLocation(null)}
        />
      );
    }

    if (company) {
      return (
        <CompanyActions
          company={company}
          onSelectLocation={wizard.setSelectedLocation}
        />
      );
    }
  }

  return (
    <WizardLayout>
      <Text style={globalStyles.title}>Step 3 - Select a company</Text>
      <Text style={[globalStyles.text, styles.description]}>
        You can manage more than one company in MyTurn. Select the company you
        want to configure, or create another company to set up.
      </Text>
      <View style={styles.fullWidthGroup}>
        {wizard.companies.map((company) => (
          <ActionButton
            key={company.id}
            title={company.name}
            onPress={() => wizard.setSelectedCompanyId(company.id)}
            secondary={wizard.selectedCompanyId !== company.id}
          />
        ))}
        <ActionButton
          title="+ Add another company"
          onPress={() => wizard.setShowCompanyForm((previous) => !previous)}
          secondary
        />
      </View>
      {wizard.showCompanyForm && (
        <CreateCompanyForm onCreated={handleCompanyCreated} />
      )}
    </WizardLayout>
  );
};

const CompanyActions = ({
  company,
  onSelectLocation,
}: {
  company: CompanySummary;
  onSelectLocation: (location: LocationSummary) => void;
}) => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const { staff, locations, fetchStaff, fetchLocations } =
    useCompanySetupActions(company);

  return (
    <WizardLayout>
      <Text style={globalStyles.title}>Step 4 - Set up {company.name}</Text>
      <Text style={[globalStyles.text, styles.sectionTitle]}>Staff</Text>
      <Text style={globalStyles.text}>
        Staff are employees who serve customers. They will later start a work
        session at a desk, and staff accounts are created by the admin.
      </Text>
      <ActionButton
        title="Add Staff Member"
        onPress={() => setShowStaffForm((previous) => !previous)}
      />
      {showStaffForm && (
        <RegisterStaffForm
          companyId={company.id}
          onCreated={() => {
            setShowStaffForm(false);
            void fetchStaff();
          }}
        />
      )}
      {staff.length > 0 && (
        <View style={styles.fullWidthGroup}>
          <Text style={[globalStyles.text, styles.sectionTitle]}>
            Staff members
          </Text>
          {staff.map((member) => (
            <ActionButton
              key={member.id}
              title={member.name || member.username}
              onPress={() => undefined}
              secondary
            />
          ))}
        </View>
      )}

      <Text style={[globalStyles.text, styles.sectionTitle]}>Locations</Text>
      <Text style={globalStyles.text}>
        A location can be a branch, office, shop, or public service point.
        Queues, services, and desks are configured inside a location.
      </Text>
      <ActionButton
        title="Add Location"
        onPress={() => setShowLocationForm((previous) => !previous)}
      />
      {showLocationForm && (
        <CreateLocationForm
          companyId={company.id}
          onCreated={() => {
            setShowLocationForm(false);
            void fetchLocations();
          }}
        />
      )}
      {locations.length > 0 && (
        <View style={styles.fullWidthGroup}>
          <Text style={[globalStyles.text, styles.sectionTitle]}>
            Locations
          </Text>
          {locations.map((location) => (
            <ActionButton
              key={location.id}
              title={location.name}
              onPress={() => onSelectLocation(location)}
              secondary
            />
          ))}
        </View>
      )}
    </WizardLayout>
  );
};

const LocationActions = ({
  company,
  location,
  onBack,
}: {
  company: CompanySummary;
  location: LocationSummary;
  onBack: () => void;
}) => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const [showQueueForm, setShowQueueForm] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showDeskForm, setShowDeskForm] = useState(false);
  const { queues, services, desks, fetchQueues, fetchServices, fetchDesks } =
    useLocationSetupActions(location);

  return (
    <WizardLayout>
      <Text style={globalStyles.title}>Step 5 - Set up {location.name}</Text>
      <Text style={globalStyles.text}>Company: {company.name}</Text>
      {location.address && (
        <Text style={globalStyles.text}>Address: {location.address}</Text>
      )}

      <Text style={[globalStyles.text, styles.sectionTitle]}>Queues</Text>
      <Text style={globalStyles.text}>
        A queue is a waiting line. Tickets are issued into a queue.
      </Text>
      <ActionButton
        title="Add Queue"
        onPress={() => setShowQueueForm((previous) => !previous)}
      />
      {showQueueForm && (
        <CreateQueueForm
          locationId={location.id}
          onCreated={() => {
            setShowQueueForm(false);
            void fetchQueues();
          }}
        />
      )}
      {queues.map((queue) => (
        <ActionButton
          key={queue.id}
          title={queue.name}
          onPress={() => undefined}
          secondary
        />
      ))}

      <Text style={[globalStyles.text, styles.sectionTitle]}>Services</Text>
      <Text style={globalStyles.text}>
        Services describe what a customer wants to do and can help estimate
        waiting time.
      </Text>
      <ActionButton
        title="Add Service"
        onPress={() => setShowServiceForm((previous) => !previous)}
      />
      {showServiceForm && (
        <CreateServiceForm
          locationId={location.id}
          queues={queues}
          onCreated={() => {
            setShowServiceForm(false);
            void fetchServices();
          }}
        />
      )}
      {services.map((service) => (
        <ActionButton
          key={service.id}
          title={service.name}
          onPress={() => undefined}
          secondary
        />
      ))}

      <Text style={[globalStyles.text, styles.sectionTitle]}>Desks</Text>
      <Text style={globalStyles.text}>
        Every desk must be connected to one queue, so create a queue before
        adding a desk.
      </Text>
      <ActionButton
        title="Add Desk"
        onPress={() => setShowDeskForm((previous) => !previous)}
        disabled={queues.length === 0}
      />
      {queues.length === 0 && (
        <Text style={globalStyles.dimText}>
          Create a queue before adding a desk.
        </Text>
      )}
      {showDeskForm && (
        <CreateDeskForm
          locationId={location.id}
          queues={queues}
          onCreated={() => {
            setShowDeskForm(false);
            void fetchDesks();
          }}
        />
      )}
      {desks.map((desk) => {
        const queue = queues.find((item) => item.id === desk.queueId);
        return (
          <ActionButton
            key={desk.id}
            title={`${desk.name}${queue ? ` - ${queue.name}` : ""}`}
            onPress={() => undefined}
            secondary
          />
        );
      })}

      <ActionButton title="Back to Company" onPress={onBack} secondary />
    </WizardLayout>
  );
};

const WizardLayout = ({ children }: { children: React.ReactNode }) => {
  const {
    roomCode,
    setRoomCode,
    username,
    setUsername,
    isConnected,
    hasPeer,
    connectToChatRoom,
    disconnectFromChatRoom,
  } = useRoomContext();

  return (
    <View style={{ flex: 1 }}>
      <Navbar
        roomId={roomCode}
        setRoomId={setRoomCode}
        username={username}
        setUsername={setUsername}
        handleConnectSocket={connectToChatRoom}
        handleDisconnectSocket={disconnectFromChatRoom}
        isConnected={isConnected}
        hasPeer={hasPeer}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </View>
  );
};

const ActionButton = ({
  title,
  onPress,
  secondary = false,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        secondary ? globalStyles.secondaryButton : globalStyles.primaryButton,
        disabled && { opacity: 0.5 },
      ]}
    >
      <Text
        style={
          secondary
            ? globalStyles.secondaryButtonText
            : globalStyles.primaryButtonText
        }
      >
        {title}
      </Text>
    </Pressable>
  );
};

const styles = {
  content: {
    alignItems: "center" as const,
    gap: 16,
    padding: 20,
  },
  description: {
    maxWidth: 420,
    textAlign: "center" as const,
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  fullWidthGroup: {
    width: "100%" as const,
    maxWidth: 420,
    gap: 10,
  },
};

export default CompanyWizard;
