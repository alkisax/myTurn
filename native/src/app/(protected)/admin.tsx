import { useContext, useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Share,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";

import { UserAuthContext } from "@/authLogin/context/UserAuthContext";
import { publicWebUrl } from "@/constants/constants";
import Navbar from "@/layout/Navbar";
import { ThemeContext } from "@/context/ThemeContext";
import { createAdminStyles } from "@/styles/admin.styles";
import useAdminPanel, {
  type AdminPanelKey,
  type AdminPanelApi,
} from "@/hooks/adminPageHooks/useAdminPanel";
import { COLORS, createGlobalStyles } from "@/styles/global";
import type {
  AdminCompany,
  AdminDesk,
  AdminLocation,
  AdminQueue,
  AdminService,
  AdminStaffMember,
  LocationAnalytics,
  QueueAnalytics,
  StaffAnalytics,
} from "@/types/adminPanel.types";

const styles = createAdminStyles(COLORS.light);

type FormState = {
  name: string;
  slug: string;
  description: string;
  address: string;
  country: string;
  latitude: string;
  longitude: string;
  timeZoneId: string;
  missedTicketExpiryMinutes: string;
  defaultEstimatedServiceMinutes: string;
  defaultServiceMinutes: string;
  maxWaitingTickets: string;
  opensAt: string;
  closesAt: string;
  resetAt: string;
  estimatedServiceMinutes: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  queueId: number | null;
  isActive: boolean;
  isRemoteTicketingAllowed: boolean;
  resetNumberDaily: boolean;
  autoResetEnabled: boolean;
  isGeneric: boolean;
};

const emptyForm: FormState = {
  name: "",
  slug: "",
  description: "",
  address: "",
  country: "",
  latitude: "",
  longitude: "",
  timeZoneId: "",
  missedTicketExpiryMinutes: "10",
  defaultEstimatedServiceMinutes: "5",
  defaultServiceMinutes: "",
  maxWaitingTickets: "",
  opensAt: "",
  closesAt: "",
  resetAt: "",
  estimatedServiceMinutes: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  queueId: null,
  isActive: true,
  isRemoteTicketingAllowed: true,
  resetNumberDaily: false,
  autoResetEnabled: false,
  isGeneric: false,
};

const tabs: Array<{ key: AdminPanelKey; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "organizations", label: "Organizations" },
  { key: "locations", label: "Locations" },
  { key: "queues", label: "Queues" },
  { key: "services", label: "Services" },
  { key: "desks", label: "Desks" },
  { key: "staff", label: "Staff" },
  { key: "analytics", label: "Analytics" },
];

export default function AdminPanel() {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const styles = createAdminStyles(colors);
  const { user } = useContext(UserAuthContext);
  const admin = useAdminPanel();
  const [activeTab, setActiveTab] = useState<AdminPanelKey>("overview");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [infoCompany, setInfoCompany] = useState<AdminCompany | null>(null);

  const isAdmin = Boolean(
    user?.roles.includes("ADMIN") || user?.roles.includes("SUPERADMIN"),
  );

  useEffect(() => {
    if (activeTab === "analytics" && admin.selectedCompanyId !== null) {
      void admin.loadAnalytics();
    }
  }, [activeTab, admin.loadAnalytics, admin.selectedCompanyId]);

  if (!isAdmin) {
    return (
      <Text style={globalStyles.text}>
        You need an ADMIN account to access this panel.
      </Text>
    );
  }

  const update = (
    field: keyof FormState,
    value: string | boolean | number | null,
  ) => setForm((current) => ({ ...current, [field]: value }));
  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };
  const confirmDelete = (message: string, action: () => Promise<void>) =>
    Alert.alert("Confirm action", message, [
      { text: "Cancel", style: "cancel" },
      { text: "Confirm", style: "destructive", onPress: () => void action() },
    ]);
  const selectedCompany =
    admin.companies.find((company) => company.id === admin.selectedCompanyId) ??
    null;

  const publicUrl = infoCompany ? `${publicWebUrl}/${infoCompany.slug}` : null;

  const openCompany = (company?: AdminCompany) => {
    setEditingId(company?.id ?? null);
    setForm(
      company
        ? {
            ...emptyForm,
            name: company.name,
            missedTicketExpiryMinutes: String(
              company.missedTicketExpiryMinutes,
            ),
            defaultEstimatedServiceMinutes: String(
              company.defaultEstimatedServiceMinutes,
            ),
          }
        : emptyForm,
    );
    setFormOpen(true);
  };
  const saveCompany = async () => {
    const body = {
      name: form.name.trim(),
      missedTicketExpiryMinutes: Number(form.missedTicketExpiryMinutes),
      defaultEstimatedServiceMinutes: Number(
        form.defaultEstimatedServiceMinutes,
      ),
    };
    if (
      !body.name ||
      !Number.isInteger(body.missedTicketExpiryMinutes) ||
      body.missedTicketExpiryMinutes < 1 ||
      !Number.isInteger(body.defaultEstimatedServiceMinutes) ||
      body.defaultEstimatedServiceMinutes < 1
    ) {
      admin.setError(
        "Organization name and positive whole-number durations are required",
      );
      return;
    }
    try {
      await admin.saveCompany(editingId, body);
      closeForm();
    } catch (error) {
      admin.setError(
        error instanceof Error ? error.message : "Failed to save organization",
      );
    }
  };

  const openLocation = (location?: AdminLocation) => {
    setEditingId(location?.id ?? null);
    setForm(
      location
        ? {
            ...emptyForm,
            name: location.name,
            address: location.address ?? "",
            country: location.country ?? "",
            latitude: location.latitude?.toString() ?? "",
            longitude: location.longitude?.toString() ?? "",
            timeZoneId: location.timeZoneId ?? "",
            isActive: location.isActive,
          }
        : emptyForm,
    );
    setFormOpen(true);
  };
  const saveLocation = async () => {
    if (admin.selectedCompanyId === null || !form.name.trim()) {
      admin.setError("Location name is required");
      return;
    }
    const latitude = form.latitude ? Number(form.latitude) : null;
    const longitude = form.longitude ? Number(form.longitude) : null;
    if (
      (latitude !== null && Number.isNaN(latitude)) ||
      (longitude !== null && Number.isNaN(longitude))
    ) {
      admin.setError("Latitude and longitude must be valid numbers");
      return;
    }
    try {
      await admin.saveLocation(editingId, {
        companyId: admin.selectedCompanyId,
        name: form.name.trim(),
        address: form.address || null,
        country: form.country || null,
        latitude,
        longitude,
        timeZoneId: form.timeZoneId || null,
        ...(editingId ? { isActive: form.isActive } : {}),
      });
      closeForm();
    } catch (error) {
      admin.setError(
        error instanceof Error ? error.message : "Failed to save location",
      );
    }
  };

  const openQueue = (queue?: AdminQueue) => {
    setEditingId(queue?.id ?? null);
    setForm(
      queue
        ? {
            ...emptyForm,
            name: queue.name,
            description: queue.description ?? "",
            defaultServiceMinutes:
              queue.defaultServiceMinutes?.toString() ?? "",
            maxWaitingTickets: queue.maxWaitingTickets?.toString() ?? "",
            opensAt: queue.opensAt ?? "",
            closesAt: queue.closesAt ?? "",
            resetAt: queue.resetAt ?? "",
            isActive: queue.isActive,
            isRemoteTicketingAllowed: queue.isRemoteTicketingAllowed,
            resetNumberDaily: queue.resetNumberDaily,
            autoResetEnabled: queue.autoResetEnabled,
          }
        : emptyForm,
    );
    setFormOpen(true);
  };
  const saveQueue = async () => {
    if (admin.selectedLocationId === null || !form.name.trim()) {
      admin.setError("Queue name is required");
      return;
    }
    const numeric = [form.defaultServiceMinutes, form.maxWaitingTickets].map(
      (value) => (value ? Number(value) : null),
    );
    if (
      numeric.some(
        (value) => value !== null && (!Number.isInteger(value) || value < 1),
      )
    ) {
      admin.setError("Numeric values must be whole numbers greater than zero");
      return;
    }
    const body = {
      locationId: admin.selectedLocationId,
      name: form.name.trim(),
      description: form.description || null,
      defaultServiceMinutes: numeric[0],
      maxWaitingTickets: numeric[1],
      opensAt: form.opensAt || null,
      closesAt: form.closesAt || null,
      autoResetEnabled: form.autoResetEnabled,
      resetAt: form.resetAt || null,
      ...(editingId
        ? {
            isActive: form.isActive,
            isRemoteTicketingAllowed: form.isRemoteTicketingAllowed,
            resetNumberDaily: form.resetNumberDaily,
          }
        : {}),
    };
    try {
      await admin.saveQueue(editingId, body);
      closeForm();
    } catch (error) {
      admin.setError(
        error instanceof Error ? error.message : "Failed to save queue",
      );
    }
  };

  const openService = (service?: AdminService) => {
    setEditingId(service?.id ?? null);
    setForm(
      service
        ? {
            ...emptyForm,
            name: service.name,
            description: service.description ?? "",
            estimatedServiceMinutes:
              service.estimatedServiceMinutes?.toString() ?? "",
            queueId: service.queueId,
            isGeneric: service.isGeneric,
            isActive: service.isActive,
          }
        : { ...emptyForm, queueId: admin.selectedQueueId },
    );
    setFormOpen(true);
  };
  const saveService = async () => {
    const minutes = form.estimatedServiceMinutes
      ? Number(form.estimatedServiceMinutes)
      : null;
    if (
      admin.selectedLocationId === null ||
      form.queueId === null ||
      !form.name.trim()
    ) {
      admin.setError("Name, location and queue are required");
      return;
    }
    if (minutes !== null && (!Number.isInteger(minutes) || minutes < 1)) {
      admin.setError("Estimated service minutes must be positive");
      return;
    }
    try {
      await admin.saveService(editingId, {
        locationId: admin.selectedLocationId,
        queueId: form.queueId,
        name: form.name.trim(),
        description: form.description || null,
        estimatedServiceMinutes: minutes,
        isGeneric: form.isGeneric,
        ...(editingId ? { isActive: form.isActive } : {}),
      });
      closeForm();
    } catch (error) {
      admin.setError(
        error instanceof Error ? error.message : "Failed to save service",
      );
    }
  };

  const openDesk = (desk?: AdminDesk) => {
    setEditingId(desk?.id ?? null);
    setForm(
      desk
        ? {
            ...emptyForm,
            name: desk.name,
            queueId: desk.queueId,
            isActive: desk.isActive,
          }
        : { ...emptyForm, queueId: admin.selectedQueueId },
    );
    setFormOpen(true);
  };
  const saveDesk = async () => {
    if (
      admin.selectedLocationId === null ||
      form.queueId === null ||
      !form.name.trim()
    ) {
      admin.setError("Name, location and queue are required");
      return;
    }
    try {
      await admin.saveDesk(editingId, {
        locationId: admin.selectedLocationId,
        queueId: form.queueId,
        name: form.name.trim(),
        ...(editingId ? { isActive: form.isActive } : {}),
      });
      closeForm();
    } catch (error) {
      admin.setError(
        error instanceof Error ? error.message : "Failed to save desk",
      );
    }
  };

  const openStaff = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const saveStaff = async () => {
    if (
      admin.selectedCompanyId === null ||
      !form.username.trim() ||
      form.password.length < 6
    ) {
      admin.setError(
        "Username and a password of at least 6 characters are required",
      );
      return;
    }
    if (form.password !== form.confirmPassword) {
      admin.setError("Passwords do not match");
      return;
    }
    try {
      await admin.createStaff({
        username: form.username.trim(),
        name: form.name.trim() || null,
        email: form.email.trim() || null,
        password: form.password,
      });
      closeForm();
    } catch (error) {
      admin.setError(
        error instanceof Error
          ? error.message
          : "Failed to create staff member",
      );
    }
  };

  const renderForm = () => {
    const field = (
      label: string,
      key: keyof FormState,
      keyboardType: "default" | "numeric" | "email-address" = "default",
      secureTextEntry = false,
      autoFocus = false,
    ) => (
      <TextInput
        key={key}
        placeholder={label}
        value={String(form[key])}
        onChangeText={(value) => update(key, value)}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoFocus={autoFocus}
        placeholderTextColor={colors.dimText}
        style={globalStyles.input}
      />
    );
    const toggles = (items: Array<[string, keyof FormState]>) =>
      items.map(([label, key]) => (
        <Pressable
          key={key}
          onPress={() => update(key, !form[key])}
          style={globalStyles.row}
        >
          <Text style={globalStyles.text}>
            {form[key] ? "☑" : "☐"} {label}
          </Text>
        </Pressable>
      ));
    if (activeTab === "organizations") {
      return (
        <AdminForm
          title={editingId ? "Edit Organization" : "Add Organization"}
          fields={[
            field("Name", "name", "default", false, Boolean(editingId)),
            field(
              "Missed ticket expiry minutes",
              "missedTicketExpiryMinutes",
              "numeric",
            ),
            field(
              "Default estimated service minutes",
              "defaultEstimatedServiceMinutes",
              "numeric",
            ),
          ]}
          onSave={() => void saveCompany()}
          onCancel={closeForm}
        />
      );
    }
    if (activeTab === "locations")
      return (
        <AdminForm
          title={editingId ? "Edit Location" : "Add Location"}
          fields={[
            field("Name", "name"),
            field("Address", "address"),
            field("Country", "country"),
            field("Latitude", "latitude", "numeric"),
            field("Longitude", "longitude", "numeric"),
            field("Time Zone", "timeZoneId"),
            ...(editingId ? toggles([["Active", "isActive"]]) : []),
          ]}
          onSave={() => void saveLocation()}
          onCancel={closeForm}
        />
      );
    if (activeTab === "queues") {
      return (
        <AdminForm
          title={editingId ? "Edit Queue" : "Add Queue"}
          fields={[
            field("Name", "name"),
            field("Description", "description"),
            field(
              "Default service minutes",
              "defaultServiceMinutes",
              "numeric",
            ),
            field("Maximum waiting tickets", "maxWaitingTickets", "numeric"),
            field("Opens at", "opensAt"),
            field("Closes at", "closesAt"),
            field("Reset at", "resetAt"),
            ...toggles([
              ["Active", "isActive"],
              ["Remote ticketing allowed", "isRemoteTicketingAllowed"],
              ["Reset number daily", "resetNumberDaily"],
              ["Automatic reset enabled", "autoResetEnabled"],
            ]),
          ]}
          onSave={() => void saveQueue()}
          onCancel={closeForm}
        />
      );
    }
    if (activeTab === "services")
      return (
        <AdminForm
          title={editingId ? "Edit Service" : "Add Service"}
          fields={[
            field("Name", "name"),
            field("Description", "description"),
            field(
              "Estimated service minutes",
              "estimatedServiceMinutes",
              "numeric",
            ),
            <OptionList
              key="service-queues"
              label="Queue"
              options={admin.queues.map((queue) => ({
                id: queue.id,
                name: queue.name,
              }))}
              selected={form.queueId}
              onSelect={(id) => update("queueId", id)}
            />,
            ...toggles([
              ["Generic service", "isGeneric"],
              ...(editingId
                ? [["Active", "isActive"] as [string, keyof FormState]]
                : []),
            ]),
          ]}
          onSave={() => void saveService()}
          onCancel={closeForm}
        />
      );
    if (activeTab === "desks")
      return (
        <AdminForm
          title={editingId ? "Edit Desk" : "Add Desk"}
          fields={[
            field("Name", "name"),
            <OptionList
              key="desk-queues"
              label="Queue"
              options={admin.queues.map((queue) => ({
                id: queue.id,
                name: queue.name,
              }))}
              selected={form.queueId}
              onSelect={(id) => update("queueId", id)}
            />,
            ...(editingId ? toggles([["Active", "isActive"]]) : []),
          ]}
          onSave={() => void saveDesk()}
          onCancel={closeForm}
        />
      );
    return (
      <AdminForm
        title="Add Staff"
        fields={[
          field("Username", "username"),
          field("Name", "name"),
          field("Email", "email", "email-address"),
          field("Password", "password", "default", true),
          field("Confirm password", "confirmPassword", "default", true),
        ]}
        onSave={() => void saveStaff()}
        onCancel={closeForm}
      />
    );
  };

  const renderSection = () => {
    if (activeTab === "overview") {
      return (
        <Overview
          companies={admin.companies}
          selectedCompany={selectedCompany}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            closeForm();
          }}
        />
      );
    }
    if (activeTab === "organizations") {
      return (
        <Organizations
          admin={admin}
          onOpen={openCompany}
          onInfo={setInfoCompany}
          onDelete={(company) =>
            confirmDelete(`Delete organization "${company.name}"?`, () =>
              admin.deleteCompany(company.id),
            )
          }
        />
      );
    }
    if (activeTab === "locations")
      return (
        <Locations
          admin={admin}
          onOpen={openLocation}
          onDelete={(location) =>
            confirmDelete(`Delete location "${location.name}"?`, () =>
              admin.deleteLocation(location.id),
            )
          }
        />
      );
    if (activeTab === "queues")
      return (
        <Queues
          admin={admin}
          onOpen={openQueue}
          onDelete={(queue) =>
            confirmDelete(`Delete queue "${queue.name}"?`, () =>
              admin.deleteQueue(queue.id),
            )
          }
          onReset={(queue) =>
            confirmDelete(`Reset queue "${queue.name}"?`, () =>
              admin.resetQueue(queue.id),
            )
          }
        />
      );
    if (activeTab === "services")
      return (
        <Services
          admin={admin}
          onOpen={openService}
          onDelete={(service) =>
            confirmDelete(`Delete service "${service.name}"?`, () =>
              admin.deleteService(service.id),
            )
          }
        />
      );
    if (activeTab === "desks")
      return (
        <Desks
          admin={admin}
          onOpen={openDesk}
          onDelete={(desk) =>
            confirmDelete(`Delete desk "${desk.name}"?`, () =>
              admin.deleteDesk(desk.id),
            )
          }
        />
      );
    if (activeTab === "staff")
      return (
        <Staff
          admin={admin}
          onOpen={openStaff}
          onDelete={(member) =>
            confirmDelete(
              `Remove ${member.name || member.username} from this organization?`,
              () => admin.removeStaff(member.id),
            )
          }
        />
      );
    return <Analytics admin={admin} />;
  };

  return (
    <SafeAreaView edges={["bottom"]} style={globalStyles.screen}>
      <Navbar />
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraHeight={110}
        extraScrollHeight={20}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabList}
        >
          {tabs.map((tab) => (
            <Pressable
              key={tab.key}
              onPress={() => {
                setActiveTab(tab.key);
                closeForm();
              }}
              style={[
                globalStyles.secondaryButton,
                styles.tabButton,
                activeTab === tab.key && styles.tabButtonSelected,
              ]}
            >
              <Text numberOfLines={1} style={styles.tabText}>
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {admin.loading && (
          <Text style={globalStyles.dimText}>Loading organizations...</Text>
        )}

        {admin.error ? (
          <Text style={globalStyles.error}>{admin.error}</Text>
        ) : null}

        {selectedCompany && activeTab !== "organizations" && (
          <OptionList
            label="Organization"
            options={admin.companies}
            selected={admin.selectedCompanyId}
            onSelect={admin.setSelectedCompanyId}
          />
        )}

        {renderSection()}

        {formOpen && renderForm()}
      </KeyboardAwareScrollView>

      <Modal
        visible={infoCompany !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setInfoCompany(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[globalStyles.card, styles.infoModal]}>
            {infoCompany && publicUrl ? (
              <>
                <Text style={globalStyles.title}>{infoCompany.name}</Text>
                <Text style={globalStyles.text}>Slug: {infoCompany.slug}</Text>
                <Text style={globalStyles.text}>
                  Default service minutes:{" "}
                  {infoCompany.defaultEstimatedServiceMinutes}
                </Text>
                <Text style={globalStyles.text}>
                  Missed ticket expiry minutes:{" "}
                  {infoCompany.missedTicketExpiryMinutes}
                </Text>
                <Text style={globalStyles.text}>Public URL: {publicUrl}</Text>
                <View style={styles.qrContainer}>
                  <QRCode value={publicUrl} size={180} />
                </View>
                <Action
                  title="Share public link"
                  onPress={() => void Share.share({ message: publicUrl })}
                />
                <Action title="Close" onPress={() => setInfoCompany(null)} />
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const AdminForm = ({
  title,
  fields,
  onSave,
  onCancel,
}: {
  title: string;
  fields: React.ReactNode[];
  onSave: () => void;
  onCancel: () => void;
}) => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  return (
    <View style={globalStyles.card}>
      <Text style={globalStyles.title}>{title}</Text>
      <View style={{ gap: 12, marginTop: 16 }}>{fields}</View>
      <View style={styles.buttonRow}>
        <Pressable style={globalStyles.secondaryButton} onPress={onCancel}>
          <Text style={globalStyles.secondaryButtonText}>Cancel</Text>
        </Pressable>
        <Pressable style={globalStyles.primaryButton} onPress={onSave}>
          <Text style={globalStyles.primaryButtonText}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
};
const OptionList = ({
  label,
  options,
  selected,
  onSelect,
}: {
  label: string;
  options: Array<{ id: number; name: string }>;
  selected: number | null;
  onSelect: (id: number | null) => void;
}) => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  return (
    <View style={{ gap: 8 }}>
      <Text style={globalStyles.dimText}>{label}</Text>
      {options.map((option) => (
        <Pressable
          key={option.id}
          onPress={() => onSelect(option.id)}
          style={[
            globalStyles.secondaryButton,
            selected === option.id && globalStyles.primaryButtonActive,
          ]}
        >
          <Text style={globalStyles.secondaryButtonText}>{option.name}</Text>
        </Pressable>
      ))}
    </View>
  );
};
const Overview = ({
  companies,
  selectedCompany,
  onSelectTab,
}: {
  companies: AdminCompany[];
  selectedCompany: AdminCompany | null;
  onSelectTab: (tab: AdminPanelKey) => void;
}) => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const sections = [
    [
      "Organizations",
      "Manage the organizations you control and their general settings.",
    ],
    [
      "Locations",
      "Add and manage the places where your organization serves customers.",
    ],
    [
      "Queues",
      "Create waiting lines, adjust how they work, and reset them when needed.",
    ],
    [
      "Services",
      "Define what customers can request and how long each service usually takes.",
    ],
    [
      "Desks",
      "Set up the service points where staff call and serve customers.",
    ],
    [
      "Staff",
      "Add staff members to your organization and remove them when needed.",
    ],
    [
      "Analytics",
      "See how tickets, queues, locations, and staff are performing.",
    ],
  ];

  return (
    <View style={styles.section}>
      <Text style={globalStyles.title}>Admin Overview</Text>
      <Text style={styles.overviewIntro}>
        Use these sections to set up your organization and understand how it
        serves customers.
      </Text>
      <Text style={globalStyles.text}>Organizations: {companies.length}</Text>
      <Text style={globalStyles.text}>
        {selectedCompany
          ? `Selected organization: ${selectedCompany.name}`
          : "Select an organization to manage it."}
      </Text>

      {sections.map(([title, description]) => {
        const tab = tabs.find((item) => item.label === title);

        return (
          <Pressable
            key={title}
            onPress={() => {
              if (tab) {
                onSelectTab(tab.key);
              }
            }}
            style={styles.overviewCard}
          >
            <View style={styles.overviewCardContent}>
              <Text style={styles.overviewCardTitle}>{title}</Text>
              <Text style={globalStyles.dimText}>{description}</Text>
            </View>
            <Text style={styles.overviewIndicator}>{">"}</Text>
          </Pressable>
        );
      })}

      <InfoBlock
        title="Getting started"
        text="Select an organization from Organizations first. Then configure its locations, queues, services, desks, and staff."
      />
    </View>
  );
};

const InfoBlock = ({ title, text }: { title: string; text: string }) => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);

  return (
    <View style={globalStyles.card}>
      <Text style={globalStyles.text}>{title}</Text>
      <Text style={globalStyles.dimText}>{text}</Text>
    </View>
  );
};
const Action = ({
  title,
  onPress,
  disabled = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
}) => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[globalStyles.secondaryButton, disabled && { opacity: 0.5 }]}
    >
      <Text style={globalStyles.secondaryButtonText}>{title}</Text>
    </Pressable>
  );
};

const Organizations = ({
  admin,
  onOpen,
  onInfo,
  onDelete,
}: {
  admin: AdminPanelApi;
  onOpen: (company: AdminCompany) => void;
  onInfo: (company: AdminCompany) => void;
  onDelete: (company: AdminCompany) => void;
}) => (
  <View style={styles.section}>
    <InfoBlock
      title="About Organizations"
      text="An organization owns its locations, queues, services, desks, staff, and tickets. The QR code opens the public customer link."
    />
    <Text style={styles.heading}>Organizations</Text>
    <Action
      title="Add organization"
      onPress={() =>
        onOpen({
          id: 0,
          name: "",
          slug: "",
          missedTicketExpiryMinutes: 30,
          defaultEstimatedServiceMinutes: 10,
          createdAt: "",
        })
      }
    />
    {admin.companies.map((company) => (
      <View
        key={company.id}
        style={[
          styles.item,
          admin.selectedCompanyId === company.id && styles.itemSelected,
        ]}
      >
        <Text style={styles.itemTitle}>{company.name}</Text>
        <Text style={styles.itemText}>Slug: {company.slug}</Text>
        <Text style={styles.itemText}>
          Default service minutes: {company.defaultEstimatedServiceMinutes}
        </Text>
        <Text style={styles.itemText}>
          Missed ticket expiry minutes: {company.missedTicketExpiryMinutes}
        </Text>
        <View style={styles.buttonRow}>
          <Action
            title="Select"
            onPress={() => admin.setSelectedCompanyId(company.id)}
          />
          <Action title="Info" onPress={() => onInfo(company)} />
          <Action title="Edit" onPress={() => onOpen(company)} />
          <Action title="Delete" onPress={() => onDelete(company)} />
        </View>
      </View>
    ))}
  </View>
);

const Locations = ({
  admin,
  onOpen,
  onDelete,
}: {
  admin: AdminPanelApi;
  onOpen: (location: AdminLocation) => void;
  onDelete: (location: AdminLocation) => void;
}) => (
  <View style={styles.section}>
    <InfoBlock
      title="About Locations"
      text="A location is a place where your organization serves customers. Locations can be added, updated, activated, or removed."
    />
    <Text style={styles.heading}>Locations</Text>
    <Action
      title="Add location"
      disabled={!admin.selectedCompanyId}
      onPress={() =>
        onOpen({
          id: 0,
          companyId: admin.selectedCompanyId ?? 0,
          name: "",
          slug: "",
          address: null,
          country: null,
          latitude: null,
          longitude: null,
          timeZoneId: null,
          isActive: true,
        })
      }
    />
    {admin.locations.map((location) => (
      <View key={location.id} style={styles.item}>
        <Text style={styles.itemTitle}>{location.name}</Text>
        <Text style={styles.itemText}>
          {location.address || "No address"} ·{" "}
          {location.isActive ? "Active" : "Inactive"}
        </Text>
        <View style={styles.buttonRow}>
          <Action title="Edit" onPress={() => onOpen(location)} />
          <Action title="Delete" onPress={() => onDelete(location)} />
        </View>
      </View>
    ))}
  </View>
);

const Queues = ({
  admin,
  onOpen,
  onDelete,
  onReset,
}: {
  admin: AdminPanelApi;
  onOpen: (queue: AdminQueue) => void;
  onDelete: (queue: AdminQueue) => void;
  onReset: (queue: AdminQueue) => void;
}) => (
  <View style={styles.section}>
    <Text style={styles.heading}>Queues</Text>
    <OptionList
      label="Location"
      options={admin.locations}
      selected={admin.selectedLocationId}
      onSelect={admin.setSelectedLocationId}
    />
    <Action
      title="Add queue"
      disabled={!admin.selectedLocationId}
      onPress={() =>
        onOpen({
          id: 0,
          companyId: admin.selectedCompanyId ?? 0,
          locationId: admin.selectedLocationId ?? 0,
          name: "",
          description: null,
          isActive: true,
          isRemoteTicketingAllowed: false,
          defaultServiceMinutes: null,
          maxWaitingTickets: null,
          opensAt: null,
          closesAt: null,
          resetNumberDaily: false,
          autoResetEnabled: false,
          resetAt: null,
        })
      }
    />
    {admin.queues.map((queue) => (
      <View key={queue.id} style={styles.item}>
        <Text style={styles.itemTitle}>{queue.name}</Text>
        <Text style={styles.itemText}>
          {queue.isActive ? "Active" : "Inactive"} ·{" "}
          {queue.isRemoteTicketingAllowed
            ? "Remote ticketing"
            : "Local ticketing"}
        </Text>
        <View style={styles.buttonRow}>
          <Action title="Edit" onPress={() => onOpen(queue)} />
          <Action title="Reset queue" onPress={() => onReset(queue)} />
          <Action title="Delete" onPress={() => onDelete(queue)} />
        </View>
      </View>
    ))}
  </View>
);

const Services = ({
  admin,
  onOpen,
  onDelete,
}: {
  admin: AdminPanelApi;
  onOpen: (service: AdminService) => void;
  onDelete: (service: AdminService) => void;
}) => (
  <View style={styles.section}>
    <Text style={styles.heading}>Services</Text>
    <OptionList
      label="Location"
      options={admin.locations}
      selected={admin.selectedLocationId}
      onSelect={admin.setSelectedLocationId}
    />
    <OptionList
      label="Queue"
      options={admin.queues}
      selected={admin.selectedQueueId}
      onSelect={admin.setSelectedQueueId}
    />
    <Action
      title="Add service"
      disabled={!admin.selectedQueueId}
      onPress={() =>
        onOpen({
          id: 0,
          locationId: admin.selectedLocationId ?? 0,
          queueId: admin.selectedQueueId ?? 0,
          name: "",
          description: null,
          estimatedServiceMinutes: null,
          isActive: true,
          isGeneric: false,
        })
      }
    />
    {admin.services.map((service) => (
      <View key={service.id} style={styles.item}>
        <Text style={styles.itemTitle}>{service.name}</Text>
        <Text style={styles.itemText}>
          {service.isGeneric ? "Generic" : "Specific"} ·{" "}
          {service.isActive ? "Active" : "Inactive"}
        </Text>
        <View style={styles.buttonRow}>
          <Action title="Edit" onPress={() => onOpen(service)} />
          <Action title="Delete" onPress={() => onDelete(service)} />
        </View>
      </View>
    ))}
  </View>
);

const Desks = ({
  admin,
  onOpen,
  onDelete,
}: {
  admin: AdminPanelApi;
  onOpen: (desk: AdminDesk) => void;
  onDelete: (desk: AdminDesk) => void;
}) => (
  <View style={styles.section}>
    <Text style={styles.heading}>Desks</Text>
    <OptionList
      label="Location"
      options={admin.locations}
      selected={admin.selectedLocationId}
      onSelect={admin.setSelectedLocationId}
    />
    <OptionList
      label="Queue"
      options={admin.queues}
      selected={admin.selectedQueueId}
      onSelect={admin.setSelectedQueueId}
    />
    <Action
      title="Add desk"
      disabled={!admin.selectedQueueId}
      onPress={() =>
        onOpen({
          id: 0,
          companyId: admin.selectedCompanyId ?? 0,
          locationId: admin.selectedLocationId ?? 0,
          queueId: admin.selectedQueueId ?? 0,
          name: "",
          isActive: true,
        })
      }
    />
    {admin.desks.map((desk) => (
      <View key={desk.id} style={styles.item}>
        <Text style={styles.itemTitle}>{desk.name}</Text>
        <Text style={styles.itemText}>
          {desk.isActive ? "Active" : "Inactive"}
        </Text>
        <View style={styles.buttonRow}>
          <Action title="Edit" onPress={() => onOpen(desk)} />
          <Action title="Delete" onPress={() => onDelete(desk)} />
        </View>
      </View>
    ))}
  </View>
);

const Staff = ({
  admin,
  onOpen,
  onDelete,
}: {
  admin: AdminPanelApi;
  onOpen: () => void;
  onDelete: (member: AdminStaffMember) => void;
}) => (
  <View style={styles.section}>
    <Text style={styles.heading}>Staff</Text>
    <Action
      title="Add staff"
      disabled={!admin.selectedCompanyId}
      onPress={onOpen}
    />
    {admin.staff.map((member) => (
      <View key={member.id} style={styles.item}>
        <Text style={styles.itemTitle}>{member.name || member.username}</Text>
        <Text style={styles.itemText}>
          {member.username}
          {member.email ? ` · ${member.email}` : ""}
        </Text>
        <Action
          title="Remove organization access"
          onPress={() => onDelete(member)}
        />
      </View>
    ))}
  </View>
);

const Analytics = ({ admin }: { admin: AdminPanelApi }) => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const overview = admin.analytics.overview;
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Analytics</Text>
      {overview && (
        <Text style={globalStyles.text}>
          Tickets: {overview.totalTickets} · Waiting: {overview.waitingTickets}{" "}
          · Completed: {overview.completedTickets}
        </Text>
      )}
      {admin.analytics.completion && (
        <Text style={globalStyles.text}>
          Completion rate:{" "}
          {(admin.analytics.completion.completionRate * 100).toFixed(1)}%
        </Text>
      )}
      {admin.analytics.queues.map((item: QueueAnalytics) => (
        <Text key={item.queueId} style={globalStyles.text}>
          {item.queueName}: {item.ticketCount} tickets, {item.completedCount}{" "}
          completed
        </Text>
      ))}
      {admin.analytics.locations.map((item: LocationAnalytics) => (
        <Text key={item.locationId} style={globalStyles.text}>
          {item.locationName}: {item.ticketCount} tickets
        </Text>
      ))}
      {admin.analytics.staff.map((item: StaffAnalytics) => (
        <Text key={item.userId} style={globalStyles.text}>
          {item.name || item.username}: {item.totalServed} served
        </Text>
      ))}
    </View>
  );
};
