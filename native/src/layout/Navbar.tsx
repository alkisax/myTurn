// native\src\layout\Navbar.tsx

import { View, Text, Pressable, StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";
import { appName } from "@/constants/constants";
import MoonToggleIcon from "@/components/layout/ui/MoonToggleIcon";
import SunToggleIcon from "@/components/layout/ui/SunToggleIcon";
import ChatBox from "@/components/chat/ChatBox";
import { useRoomContext } from "@/context/RoomContext";
import { useNotificationSound } from "@/hooks/useNotificationSound";
import { UserAuthContext } from "@/authLogin/context/UserAuthContext";
import { handleLogout } from "@/authLogin/authFunctions";

type Props = {
  minimal?: boolean;
  roomId: string;
  setRoomId: (v: string) => void;
  handleConnectSocket: () => Promise<void>;
  handleDisconnectSocket: () => Promise<void>;
  isConnected: boolean;
  hasPeer: boolean;
  username?: string;
  setUsername?: (v: string) => void;
};

const Navbar = ({
  minimal = false,
  roomId,
  setRoomId,
  handleConnectSocket,
  handleDisconnectSocket,
  isConnected,
  hasPeer,
  username,
  setUsername,
}: Props) => {
  const { colors, toggle, theme } = useContext(ThemeContext);
  const styles = createStyles(colors);

  const { playChatNotification } = useNotificationSound();

  const router = useRouter();
  const { user, setUser } = useContext(UserAuthContext);
  const canManageAdminPanel = Boolean(
    user?.roles.includes("ADMIN") || user?.roles.includes("SUPERADMIN"),
  );
  const isStaffOnly = Boolean(
    user?.roles.includes("STAFF") && !canManageAdminPanel,
  );

  const [menuOpen, setMenuOpen] = useState(false);
  const [showChatBox, setShowChatBox] = useState(false);
  const [hasUnreadChat, setHasUnreadChat] = useState(false);

  const lastMessageCountRef = useRef(0);

  const handleLogoutPress = async () => {
    await handleLogout(setUser);
    router.replace("/login");
  };

  const { chatMessages, username: contextUsername } = useRoomContext();

  useEffect(() => {
    if (chatMessages.length <= lastMessageCountRef.current) {
      lastMessageCountRef.current = chatMessages.length;
      return;
    }

    const lastMessage = chatMessages[chatMessages.length - 1];

    if (!showChatBox && lastMessage.username !== contextUsername) {
      setHasUnreadChat(true);
      playChatNotification();
    }

    lastMessageCountRef.current = chatMessages.length;
  }, [chatMessages, contextUsername, showChatBox, playChatNotification]);

  if (minimal) {
    return (
      <SafeAreaView
        edges={["top"]}
        style={{
          backgroundColor: colors.topBar,
          zIndex: 999,
          elevation: 999,
        }}
      >
        <View style={styles.navbar}>
          {/* home */}
          <Pressable onPress={() => router.push("/")} style={styles.centerRow}>
            <Text style={styles.logo}>{appName}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      edges={["top"]}
      style={{
        backgroundColor: colors.topBar,
        zIndex: 999,
        elevation: 999,
      }}
    >
      <View style={styles.navbar}>
        {/* logo */}
        <Pressable onPress={() => router.push("/")}>
          <Text style={styles.logo}>{appName}</Text>
        </Pressable>

        <View style={{ flex: 1 }} />

        {/* chat */}
        {canManageAdminPanel && (
          <Pressable
            onPress={() => router.push("/admin")}
            style={styles.iconButton}
          >
            <Ionicons
              name="business-outline"
              size={26}
              color={colors.text}
            />
          </Pressable>
        )}

        {isStaffOnly && (
          <>
            <Pressable
              onPress={() => router.push("/staff")}
              style={styles.iconButton}
            >
              <Ionicons
                name="people-outline"
                size={26}
                color={colors.text}
              />
            </Pressable>
            <Pressable
              onPress={() => router.push("/staff/profile")}
              style={styles.iconButton}
            >
              <Ionicons
                name="person-circle-outline"
                size={26}
                color={colors.text}
              />
            </Pressable>
          </>
        )}

        <Pressable
          onPress={() => {
            setShowChatBox((prev) => {
              const nextValue = !prev;

              if (nextValue) {
                setHasUnreadChat(false);
              }

              return nextValue;
            });

            setMenuOpen(false);
          }}
          style={styles.iconButton}
        >
          <View>
            <Ionicons
              name={showChatBox ? "chatbubble" : "chatbubble-outline"}
              size={26}
              color={colors.text}
            />

            {hasUnreadChat && <View style={styles.chatBadge} />}
          </View>
        </Pressable>

        {showChatBox && (
          <View style={styles.chatPanel}>
            <ChatBox />
          </View>
        )}

        {/* hamburger */}
        <Pressable onPress={() => setMenuOpen((prev) => !prev)}>
          <Ionicons
            name={menuOpen ? "close" : "menu"}
            size={30}
            color={colors.text}
          />
        </Pressable>

        {/* Auth action δίπλα στο hamburger */}
        <Pressable
          onPress={() => {
            if (user) {
              void handleLogoutPress();
              return;
            }

            router.push("/login");
          }}
          style={styles.iconButton}
        >
          <Ionicons
            name={user ? "log-out-outline" : "log-in-outline"}
            size={26}
            color={colors.text}
          />
        </Pressable>

        <View style={styles.rightRow}>
          <Pressable
            onPress={() => router.push("/info")}
            style={styles.iconButton}
          >
            <Ionicons
              name="information-circle-outline"
              size={26}
              color={colors.text}
            />
          </Pressable>
        </View>

        {/* dropdown */}
        {/* το πρώτο menuOpen && είναι για να κλίνει το menu αν πατήσω εκτος */}
        {(menuOpen || showChatBox) && (
          <Pressable
            onPress={() => {
              setMenuOpen(false);
              setShowChatBox(false);
            }}
            style={styles.overlay}
          />
        )}

        {menuOpen && (
          <View style={styles.menu}>
            {/* theme */}
            <View style={styles.centerRow}>
              {theme === "dark" ? (
                <MoonToggleIcon
                  color={colors.text}
                  onFinished={() => {
                    toggle();
                  }}
                />
              ) : (
                <SunToggleIcon
                  color={colors.text}
                  onFinished={() => {
                    toggle();
                  }}
                />
              )}
            </View>

            {username !== undefined && setUsername && (
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
                placeholderTextColor={colors.dimText}
                style={styles.usernameInput}
                maxLength={20}
              />
            )}

            {/* socket row */}
            <View style={styles.socketRow}>
              {/* room */}
              <TextInput
                value={roomId}
                onChangeText={setRoomId}
                keyboardType="number-pad"
                placeholder="Room"
                placeholderTextColor={colors.dimText}
                style={[
                  styles.roomInput,
                  isConnected && styles.roomInputDisabled,
                ]}
                maxLength={4}
                editable={!isConnected}
              />

              {/* connect */}
              <Pressable
                onPress={
                  isConnected ? handleDisconnectSocket : handleConnectSocket
                }
                style={styles.iconButton}
              >
                <Text style={{ fontSize: 18 }}>
                  {isConnected ? "❌" : "🔌"}
                </Text>
              </Pressable>

              {/* status */}
              <View style={styles.statusColumn}>
                <View
                  style={[
                    styles.statusCircle,
                    {
                      backgroundColor: isConnected ? colors.green : colors.red,
                    },
                  ]}
                />

                <View
                  style={[
                    styles.statusCircle,
                    {
                      backgroundColor: hasPeer ? colors.green : colors.red,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default Navbar;

const createStyles = (colors: Record<string, string>) =>
  StyleSheet.create({
    navbar: {
      height: 60,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      backgroundColor: colors.topBar,
      borderBottomWidth: 1,
      borderBottomColor: colors.topBarBorder,
      zIndex: 999,
      elevation: 999,
    },

    logo: {
      fontWeight: "bold",
      fontSize: 18,
      color: colors.text,
    },

    menu: {
      position: "absolute",
      right: 0,
      top: 52,
      minWidth: 190,
      backgroundColor: colors.panel,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderWidth: 1,
      borderColor: colors.panelBorder,
      zIndex: 999,
      elevation: 999,
      gap: 16,
    },

    centerRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 22,
    },

    socketRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 14,
    },

    // status circles το ενα κατω απο το αλλο
    statusColumn: {
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      gap: 6,
    },

    roomInput: {
      width: 74,
      height: 40,
      borderBottomWidth: 1,
      borderBottomColor: colors.buttonBorder,
      borderColor: "#d8cf9d",
      backgroundColor: "#ffffff",
      textAlign: "center",
      color: "#030303",
      fontSize: 16,
    },

    iconButton: {
      padding: 4,
      justifyContent: "center",
      alignItems: "center",
    },

    statusCircle: {
      width: 14,
      height: 14,
      borderRadius: 7,
    },

    rightRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },

    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingVertical: 12,
    },

    menuText: {
      color: colors.text,
      fontSize: 16,
    },

    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: -1000,
      zIndex: 998,
    },

    roomInputDisabled: {
      opacity: 0.5,
    },

    usernameInput: {
      height: 40,
      borderBottomWidth: 1,
      borderBottomColor: colors.buttonBorder,
      backgroundColor: "#ffffff",
      color: "#030303",
      fontSize: 16,
      paddingHorizontal: 8,
    },

    chatPanel: {
      position: "absolute",
      right: 8,
      top: 52,
      width: 320,
      maxWidth: "95%",
      backgroundColor: colors.panel,
      borderRadius: 16,
      padding: 8,
      borderWidth: 1,
      borderColor: colors.panelBorder,
      zIndex: 999,
      elevation: 999,
    },

    chatBadge: {
      position: "absolute",
      top: -2,
      right: -2,
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor: colors.red,
    },
  });
