import { useContext } from "react";
import { useRouter } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";

import { ThemeContext } from "@/context/ThemeContext";
import useStaffTicketIdentification from "@/hooks/staffPageHooks/useStaffTicketIdentification";
import { createGlobalStyles } from "@/styles/global";
import { createStaffStyles } from "@/styles/staff.styles";
import type { StaffDesk, StaffSession } from "@/types/staff.types";
import type { Ticket } from "@/types/ticket.types";

interface Props {
  desk: StaffDesk;
  session: StaffSession;
  waitingTickets: Ticket[];
  servingTickets: Ticket[];
  missedTickets: Ticket[];
  waitingCount: number;
  servingCount: number;
  missedCount: number;
  totalTickets: number;
  nextWaitingTicket: Ticket | undefined;
  currentTicket: Ticket | null;
  loading: boolean;
  errorMessage: string;
  onNext: () => void;
  onComplete: () => void;
  onMissed: () => void;
  onRecall: (ticketId: number) => void;
  onToggleBreak: () => void;
  onEndShift: () => void;
}

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}

const ActionButton = ({
  title,
  onPress,
  disabled = false,
  secondary = false,
}: ActionButtonProps) => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const styles = createStaffStyles(colors);

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        secondary
          ? globalStyles.secondaryButton
          : globalStyles.primaryButton,
        disabled && styles.disabled,
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

const TicketServices = ({ ticket }: { ticket: Ticket }) => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const serviceNames = ticket.services.map((service) => service.name).join(", ");

  return (
    <Text style={globalStyles.dimText}>
      {serviceNames || "No service selected"}
    </Text>
  );
};

const Step4StaffWorkspace = ({
  desk,
  session,
  waitingTickets,
  servingTickets,
  missedTickets,
  waitingCount,
  servingCount,
  missedCount,
  totalTickets,
  nextWaitingTicket,
  currentTicket,
  loading,
  errorMessage,
  onNext,
  onComplete,
  onMissed,
  onRecall,
  onToggleBreak,
  onEndShift,
}: Props) => {
  const router = useRouter();
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const styles = createStaffStyles(colors);
  const isBreak = session.status === "BREAK";

  const {
    pin,
    setPin,
    identification,
    identifying,
    identificationMessage,
    identifyTicket,
  } = useStaffTicketIdentification();

  const handlePinChange = (value: string) => {
    setPin(value.slice(0, 4));
  };

  const handleOpenNumberDisplay = () => {
    router.push("/staff/number-display");
  };

  const handleOpenPublicTablet = () => {
    router.push("/staff/public-tablet");
  };

  return (
    <View style={styles.stepContainer}>
      <Text style={globalStyles.title}>Step 4 — Staff Workspace</Text>

      <View style={[globalStyles.card, styles.section]}>
        <Text style={globalStyles.text}>{desk.name}</Text>
        <Text style={globalStyles.text}>Location: {desk.locationName}</Text>
        <Text style={globalStyles.text}>Queue: {desk.queueName}</Text>
        <Text style={styles.statusText}>Status: {session.status}</Text>
      </View>

      <View style={[globalStyles.card, styles.section]}>
        <Text style={globalStyles.text}>Search Ticket by PIN</Text>
        <View style={styles.actionRow}>
          <TextInput
            value={pin}
            onChangeText={handlePinChange}
            keyboardType="number-pad"
            maxLength={4}
            placeholder="PIN"
            placeholderTextColor={colors.dimText}
            style={[globalStyles.input, { flexGrow: 1, minWidth: 130 }]}
          />
          <ActionButton
            title={identifying ? "Searching..." : "Search"}
            disabled={identifying || pin.length === 0}
            onPress={() => void identifyTicket()}
          />
        </View>

        {identificationMessage ? (
          <Text style={globalStyles.error}>{identificationMessage}</Text>
        ) : null}

        {identification ? (
          <View style={styles.section}>
            <Text style={styles.statusText}>
              Ticket #{identification.number}
            </Text>
            <Text style={globalStyles.text}>
              Queue: {identification.queueName}
            </Text>
            <Text style={globalStyles.text}>
              Status: {identification.status}
            </Text>
            <Text style={globalStyles.text}>
              Services:{" "}
              {identification.services
                .map((service) => service.name)
                .join(", ") || "None selected"}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.countGrid}>
        {[
          ["Waiting", waitingCount],
          ["Serving", servingCount],
          ["Missed", missedCount],
          ["Total", totalTickets],
        ].map(([label, value]) => (
          <View key={label} style={styles.countCard}>
            <Text style={globalStyles.dimText}>{label}</Text>
            <Text style={styles.countValue}>{value}</Text>
          </View>
        ))}
      </View>

      {errorMessage ? (
        <Text style={globalStyles.error}>{errorMessage}</Text>
      ) : null}

      {currentTicket ? (
        <View style={[globalStyles.card, styles.section]}>
          <Text style={globalStyles.text}>Current Customer</Text>
          <Text style={styles.ticketNumber}>#{currentTicket.number}</Text>

          {currentTicket.services.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.statusText}>Services</Text>
              {currentTicket.services.map((service) => (
                <Text key={service.id} style={globalStyles.text}>
                  {service.name}
                </Text>
              ))}
            </View>
          )}

          <View style={styles.actionRow}>
            <ActionButton
              title="Complete"
              disabled={loading || isBreak}
              onPress={onComplete}
            />
            <ActionButton
              title="Missed"
              secondary
              disabled={loading || isBreak}
              onPress={onMissed}
            />
          </View>
        </View>
      ) : null}

      {!currentTicket && !isBreak && (
        <ActionButton
          title={
            nextWaitingTicket
              ? `Next Customer — #${nextWaitingTicket.number}`
              : "No Waiting Customers"
          }
          disabled={loading || !nextWaitingTicket}
          onPress={onNext}
        />
      )}

      <View style={[globalStyles.card, styles.section]}>
        <Text style={globalStyles.text}>Waiting</Text>
        {waitingTickets.length === 0 ? (
          <Text style={globalStyles.dimText}>No customers are waiting.</Text>
        ) : null}
        {waitingTickets.map((ticket) => (
          <View key={ticket.id} style={styles.splitRow}>
            <Text style={styles.statusText}>#{ticket.number}</Text>
            <TicketServices ticket={ticket} />
          </View>
        ))}
      </View>

      <View style={[globalStyles.card, styles.section]}>
        <Text style={globalStyles.text}>Currently Serving</Text>
        {servingTickets.length === 0 ? (
          <Text style={globalStyles.dimText}>
            No ticket is currently being served.
          </Text>
        ) : null}
        {servingTickets.map((ticket) => (
          <View key={ticket.id} style={styles.splitRow}>
            <Text style={styles.statusText}>#{ticket.number}</Text>
            <TicketServices ticket={ticket} />
          </View>
        ))}
      </View>

      <View style={[globalStyles.card, styles.section]}>
        <Text style={globalStyles.text}>Missed Tickets</Text>
        {missedTickets.length === 0 ? (
          <Text style={globalStyles.dimText}>No missed tickets.</Text>
        ) : null}
        {missedTickets.map((ticket) => (
          <View key={ticket.id} style={styles.splitRow}>
            <View style={styles.section}>
              <Text style={styles.statusText}>#{ticket.number}</Text>
              <TicketServices ticket={ticket} />
            </View>
            <ActionButton
              title="Recall"
              secondary
              disabled={loading || isBreak || currentTicket !== null}
              onPress={() => onRecall(ticket.id)}
            />
          </View>
        ))}
      </View>

      {!currentTicket && (
        <View style={styles.section}>
          <ActionButton
            title={isBreak ? "Return to Work" : "Take Break"}
            secondary
            disabled={loading}
            onPress={onToggleBreak}
          />
          <ActionButton
            title="End Shift"
            secondary
            disabled={loading}
            onPress={onEndShift}
          />
        </View>
      )}

      <ActionButton
        title="Set this screen as a public tablet / kiosk"
        secondary
        onPress={handleOpenPublicTablet}
      />

      <ActionButton
        title="Set this screen as number display"
        secondary
        onPress={handleOpenNumberDisplay}
      />
    </View>
  );
};

export default Step4StaffWorkspace;
