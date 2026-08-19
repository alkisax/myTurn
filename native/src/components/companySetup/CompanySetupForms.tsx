import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import axios from "axios";
import { backendUrl } from "@/constants/constants";
import { createGlobalStyles } from "@/styles/global";
import { ThemeContext } from "@/context/ThemeContext";
import { useContext } from "react";
import { api, getAuthHeaders } from "@/hooks/companySetupHooks/api";
import {
  frontendValidatePassword,
  frontEndValidateEmail,
} from "@/authLogin/utils/registerBackend";
import type { CompanySummary, QueueSummary } from "@/types/companySetup.types";

type FormCardProps = {
  title: string;
  children: React.ReactNode;
};

const FormCard = ({ title, children }: FormCardProps) => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);

  return (
    <View style={globalStyles.card}>
      <Text style={globalStyles.title}>{title}</Text>
      <View style={{ gap: 12, marginTop: 20 }}>{children}</View>
    </View>
  );
};

const Field = ({
  label,
  value,
  onChangeText,
  keyboardType,
  secureTextEntry = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "numeric" | "email-address";
  secureTextEntry?: boolean;
}) => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);

  return (
    <TextInput
      placeholder={label}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      placeholderTextColor={colors.dimText}
      style={globalStyles.input}
    />
  );
};

const SubmitButton = ({
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
      style={[globalStyles.primaryButton, disabled && { opacity: 0.5 }]}
    >
      <Text style={globalStyles.primaryButtonText}>{title}</Text>
    </Pressable>
  );
};

const ErrorText = ({ message }: { message: string }) => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);

  if (!message) return null;
  return <Text style={globalStyles.error}>{message}</Text>;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    return typeof message === "string" ? message : fallback;
  }
  return fallback;
};

export const CreateCompanyForm = ({ onCreated }: { onCreated: () => void }) => {
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("10");
  const [serviceMinutes, setServiceMinutes] = useState("5");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post(
        `${backendUrl}/companies`,
        {
          name,
          missedTicketExpiryMinutes: Number(expiry),
          defaultEstimatedServiceMinutes: Number(serviceMinutes),
        },
        await getAuthHeaders(),
      );
      onCreated();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to create company"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard title="Create Company">
      <Field label="Company Name" value={name} onChangeText={setName} />
      <Field
        label="Missed Ticket Expiry (minutes)"
        value={expiry}
        onChangeText={setExpiry}
        keyboardType="numeric"
      />
      <Field
        label="Default Service Time (minutes)"
        value={serviceMinutes}
        onChangeText={setServiceMinutes}
        keyboardType="numeric"
      />
      <ErrorText message={error} />
      <SubmitButton
        title={loading ? "Creating..." : "Create Company"}
        onPress={() => void submit()}
        disabled={loading || !name.trim()}
      />
    </FormCard>
  );
};

export const CreateLocationForm = ({
  companyId,
  onCreated,
}: {
  companyId: number;
  onCreated: () => void;
}) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [timeZoneId, setTimeZoneId] = useState("Europe/Athens");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post(
        `${backendUrl}/locations`,
        {
          companyId,
          name,
          address: address || null,
          country: country || null,
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
          timeZoneId: timeZoneId || null,
        },
        await getAuthHeaders(),
      );
      onCreated();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to create location"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard title="Create Location">
      <Field label="Location Name" value={name} onChangeText={setName} />
      <Field label="Address" value={address} onChangeText={setAddress} />
      <Field label="Country" value={country} onChangeText={setCountry} />
      <Field
        label="Latitude"
        value={latitude}
        onChangeText={setLatitude}
        keyboardType="numeric"
      />
      <Field
        label="Longitude"
        value={longitude}
        onChangeText={setLongitude}
        keyboardType="numeric"
      />
      <Field
        label="Time Zone"
        value={timeZoneId}
        onChangeText={setTimeZoneId}
      />
      <ErrorText message={error} />
      <SubmitButton
        title={loading ? "Creating..." : "Create Location"}
        onPress={() => void submit()}
        disabled={loading || !name.trim()}
      />
    </FormCard>
  );
};

export const CreateQueueForm = ({
  locationId,
  onCreated,
}: {
  locationId: number;
  onCreated: () => void;
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [minutes, setMinutes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post(
        `${backendUrl}/queues`,
        {
          locationId,
          name,
          description: description || null,
          defaultServiceMinutes: minutes ? Number(minutes) : null,
          maxWaitingTickets: null,
          opensAt: null,
          closesAt: null,
          autoResetEnabled: false,
          resetAt: null,
        },
        await getAuthHeaders(),
      );
      onCreated();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to create queue"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard title="Create Queue">
      <Field label="Queue Name" value={name} onChangeText={setName} />
      <Field
        label="Description"
        value={description}
        onChangeText={setDescription}
      />
      <Field
        label="Default Service Minutes"
        value={minutes}
        onChangeText={setMinutes}
        keyboardType="numeric"
      />
      <ErrorText message={error} />
      <SubmitButton
        title={loading ? "Creating..." : "Create Queue"}
        onPress={() => void submit()}
        disabled={loading || !name.trim()}
      />
    </FormCard>
  );
};

export const CreateServiceForm = ({
  locationId,
  queues,
  onCreated,
}: {
  locationId: number;
  queues: QueueSummary[];
  onCreated: () => void;
}) => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const [name, setName] = useState("");
  const [queueId, setQueueId] = useState<number | "">("");
  const [description, setDescription] = useState("");
  const [minutes, setMinutes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    try {
      await api.post(
        `${backendUrl}/services`,
        {
          locationId,
          queueId,
          name,
          description: description || null,
          isGeneric: false,
          estimatedServiceMinutes: minutes ? Number(minutes) : null,
        },
        await getAuthHeaders(),
      );
      onCreated();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to create service"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard title="Create Service">
      <Field label="Service Name" value={name} onChangeText={setName} />
      <Field
        label="Description"
        value={description}
        onChangeText={setDescription}
      />
      <Text style={globalStyles.dimText}>Select Queue</Text>
      <View style={{ gap: 8 }}>
        {queues.map((queue) => (
          <Pressable
            key={queue.id}
            onPress={() => setQueueId(queue.id)}
            style={[
              globalStyles.secondaryButton,
              queueId === queue.id && globalStyles.primaryButtonActive,
            ]}
          >
            <Text style={globalStyles.secondaryButtonText}>{queue.name}</Text>
          </Pressable>
        ))}
      </View>
      <Field
        label="Estimated Service Minutes"
        value={minutes}
        onChangeText={setMinutes}
        keyboardType="numeric"
      />
      <ErrorText message={error} />
      <SubmitButton
        title={loading ? "Creating..." : "Create Service"}
        onPress={() => void submit()}
        disabled={loading || !name.trim() || queueId === ""}
      />
    </FormCard>
  );
};

export const CreateDeskForm = ({
  locationId,
  queues,
  onCreated,
}: {
  locationId: number;
  queues: QueueSummary[];
  onCreated: () => void;
}) => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const [name, setName] = useState("");
  const [queueId, setQueueId] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (queueId === "") {
      setError("Please select a queue");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await api.post(
        `${backendUrl}/desks`,
        { locationId, queueId, name },
        await getAuthHeaders(),
      );
      onCreated();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to create desk"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard title="Create Desk">
      <Field label="Desk Name" value={name} onChangeText={setName} />
      <Text style={globalStyles.dimText}>Select Queue</Text>
      <View style={{ gap: 8 }}>
        {queues.map((queue) => (
          <Pressable
            key={queue.id}
            onPress={() => setQueueId(queue.id)}
            style={[
              globalStyles.secondaryButton,
              queueId === queue.id && globalStyles.primaryButtonActive,
            ]}
          >
            <Text style={globalStyles.secondaryButtonText}>{queue.name}</Text>
          </Pressable>
        ))}
      </View>
      <ErrorText message={error} />
      <SubmitButton
        title={loading ? "Creating..." : "Create Desk"}
        onPress={() => void submit()}
        disabled={loading || !name.trim() || queueId === ""}
      />
    </FormCard>
  );
};

export const RegisterStaffForm = ({
  companyId,
  onCreated,
}: {
  companyId: number;
  onCreated: () => void;
}) => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    const passwordError = frontendValidatePassword(password);
    const emailError = email ? frontEndValidateEmail(email) : "";
    if (
      passwordError ||
      emailError ||
      !username ||
      !password ||
      !confirmPassword ||
      password !== confirmPassword
    ) {
      setError(
        passwordError ||
          emailError ||
          (password !== confirmPassword
            ? "Passwords do not match"
            : "Please fill in all required fields"),
      );
      setLoading(false);
      return;
    }

    try {
      await api.post(
        `${backendUrl}/company-users/company/${companyId}/staff`,
        { username, name, email, password },
        await getAuthHeaders(),
      );
      onCreated();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to create staff member"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard title="Add Staff Member">
      <Field label="Username" value={username} onChangeText={setUsername} />
      <Field label="Full Name" value={name} onChangeText={setName} />
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Field
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <ErrorText message={error} />
      <SubmitButton
        title={loading ? "Creating..." : "Create Staff"}
        onPress={() => void submit()}
        disabled={loading}
      />
    </FormCard>
  );
};

export const RegisterAdminForm = ({ onCreated }: { onCreated: () => void }) => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");
    const passwordError = frontendValidatePassword(password);
    const emailError = frontEndValidateEmail(email);
    if (
      passwordError ||
      emailError ||
      !username ||
      !name ||
      !email ||
      !password ||
      !confirmPassword ||
      password !== confirmPassword
    ) {
      setError(
        passwordError ||
          emailError ||
          (password !== confirmPassword
            ? "Passwords do not match"
            : "Please fill in all fields"),
      );
      setLoading(false);
      return;
    }

    try {
      await api.post(`${backendUrl}/auth/register-admin`, {
        username,
        name,
        email,
        password,
      });
      onCreated();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Admin registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormCard title="Create Admin Account">
      <Text style={createGlobalStyles(useContext(ThemeContext).colors).dimText}>
        Create an admin account to add a company and use MyTurn as an admin.
      </Text>
      <Field label="Username" value={username} onChangeText={setUsername} />
      <Field label="Full Name" value={name} onChangeText={setName} />
      <Field
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Field
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      <ErrorText message={error} />
      <SubmitButton
        title={loading ? "Loading..." : "Create Admin Account"}
        onPress={() => void submit()}
        disabled={loading}
      />
    </FormCard>
  );
};
