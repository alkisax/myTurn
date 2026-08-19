import { useContext } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { handleLogout } from "@/authLogin/authFunctions";
import { UserAuthContext } from "@/authLogin/context/UserAuthContext";
import { appName } from "@/constants/constants";
import MoonToggleIcon from "@/components/layout/ui/MoonToggleIcon";
import SunToggleIcon from "@/components/layout/ui/SunToggleIcon";
import { ThemeContext } from "@/context/ThemeContext";

type Props = { minimal?: boolean };

const Navbar = ({ minimal = false }: Props) => {
  const { colors, toggle, theme } = useContext(ThemeContext);
  const { user, setUser } = useContext(UserAuthContext);
  const router = useRouter();
  const styles = createStyles(colors);

  const canManageAdminPanel = Boolean(
    user?.roles.includes("ADMIN") || user?.roles.includes("SUPERADMIN"),
  );
  const isStaff = Boolean(user?.roles.includes("STAFF"));

  const handleLogoutPress = async () => {
    await handleLogout(setUser);
    router.replace("/login");
  };

  if (minimal) {
    return (
      <SafeAreaView edges={["top"]} style={styles.safeArea}>
        <View style={styles.navbar}>
          <Pressable onPress={() => router.push("/")} style={styles.centerRow}>
            <Text style={styles.logo}>{appName}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.navbar}>
        <Pressable onPress={() => router.push("/")}>
          <Text style={styles.logo}>{appName}</Text>
        </Pressable>

        <View style={styles.spacer} />

        {canManageAdminPanel && (
          <Pressable
            onPress={() => router.push("/admin")}
            style={styles.iconButton}
          >
            <Ionicons name="business-outline" size={26} color={colors.text} />
          </Pressable>
        )}

        {isStaff && !canManageAdminPanel && (
          <>
            <Pressable
              onPress={() => router.push("/staff")}
              style={styles.iconButton}
            >
              <Ionicons name="people-outline" size={26} color={colors.text} />
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
            <Pressable
              onPress={() => router.push("/staff/number-display")}
              style={styles.iconButton}
            >
              <Ionicons name="tv-outline" size={26} color={colors.text} />
            </Pressable>
          </>
        )}

        <View style={styles.centerRow}>
          {theme === "dark" ? (
            <MoonToggleIcon color={colors.text} onFinished={toggle} />
          ) : (
            <SunToggleIcon color={colors.text} onFinished={toggle} />
          )}
        </View>

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

        {/* Το hamburger/menu είναι προσωρινά απενεργοποιημένο. */}
        {/*
        <Pressable onPress={() => setMenuOpen((previous) => !previous)}>
          <Ionicons
            name={menuOpen ? "close" : "menu"}
            size={30}
            color={colors.text}
          />
        </Pressable>

        {menuOpen && (
          <View style={styles.menu}>
            <View style={styles.centerRow}>
              {theme === "dark" ? (
                <MoonToggleIcon color={colors.text} onFinished={toggle} />
              ) : (
                <SunToggleIcon color={colors.text} onFinished={toggle} />
              )}
            </View>
          </View>
        )}
        */}
      </View>
    </SafeAreaView>
  );
};

export default Navbar;

const createStyles = (colors: Record<string, string>) =>
  StyleSheet.create({
    safeArea: {
      backgroundColor: colors.topBar,
      zIndex: 999,
      elevation: 999,
    },
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
    spacer: { flex: 1 },
    centerRow: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    iconButton: {
      padding: 4,
      justifyContent: "center",
      alignItems: "center",
    },
  });
