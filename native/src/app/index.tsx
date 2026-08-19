import { useContext } from "react";
import { Pressable, ScrollView, Text, View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useRoomContext } from "@/context/RoomContext";
import { ThemeContext } from "@/context/ThemeContext";
import Navbar from "@/layout/Navbar";
import { createGlobalStyles } from "@/styles/global";

export default function Index() {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const styles = createStyles(colors);
  const router = useRouter();

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
    <View style={globalStyles.screen}>
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
        showsVerticalScrollIndicator={false}
      >
        <Text style={globalStyles.title}>MyTurn</Text>

        <Text style={styles.description}>
          MyTurn is a digital queue management system for customers, staff, and
          organizations.
        </Text>

        <Text style={styles.chooseText}>
          Choose how you want to use MyTurn.
        </Text>

        <View style={styles.cardGroup}>
          <View style={[globalStyles.card, styles.actionCard]}>
            <Text style={styles.cardTitle}>Enter as Staff</Text>
            <Text style={globalStyles.dimText}>
              Choose your workplace and desk, then start serving customers.
            </Text>
          </View>

          <Text style={styles.startText}>
            Start from Here. Set up an organization, add locations and waiting
            queues, define services, and assign staff to serve customers.
          </Text>

          <Pressable
            style={[globalStyles.card, styles.actionCard]}
            onPress={() => router.push("/company-wizard")}
          >
            <Text style={styles.cardTitle}>Manage an Organization</Text>
            <Text style={globalStyles.dimText}>
              Set up your company, locations, staff, queues, services and desks.
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: Record<string, string>) =>
  StyleSheet.create({
    content: {
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 32,
      gap: 24,
    },
    description: {
      maxWidth: 360,
      color: colors.text,
      fontSize: 16,
      lineHeight: 24,
      textAlign: "center",
    },
    chooseText: {
      color: colors.text,
      fontSize: 16,
      textAlign: "center",
    },
    cardGroup: {
      width: "100%",
      maxWidth: 420,
      gap: 24,
      alignItems: "center",
    },
    actionCard: {
      width: "100%",
      minHeight: 180,
      justifyContent: "center",
      gap: 12,
    },
    cardTitle: {
      color: colors.text,
      fontSize: 22,
      fontWeight: "600",
      textAlign: "center",
    },
    startText: {
      maxWidth: 360,
      color: colors.dimText,
      fontSize: 14,
      lineHeight: 21,
      textAlign: "center",
      marginVertical: 12,
    },
  });
