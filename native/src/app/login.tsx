import { View, Text, TextInput, Pressable } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useRouter } from "expo-router";
import { UserAuthContext } from "../authLogin/context/UserAuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/authLogin/services/api";
import { backendUrl } from "../constants/constants";
import BgScreenWrapper from "../components/layout/BgScreenWrapper";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "@/context/ThemeContext";
import { createGlobalStyles } from "@/styles/global";
import { useRoomContext } from "@/context/RoomContext";
import Navbar from "@/layout/Navbar";

const Login = () => {
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const { user, setUser } = useContext(UserAuthContext);
  const {
    roomCode,
    setRoomCode,
    username: roomUsername,
    setUsername: setRoomUsername,
    isConnected,
    hasPeer,
    connectToChatRoom,
    disconnectFromChatRoom,
  } = useRoomContext();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace("/user");
    }
  }, [router, user]);

  const handleLogin = async () => {
    setError(null);

    try {
      const response = await api.post(`${backendUrl}/auth/login`, {
        username,
        password,
      });

      if (response.data.status) {
        const { token, user: backendUser } = response.data.data;

        await AsyncStorage.setItem("token", token);
        setUser({
          id: Number(backendUser.id),
          username: backendUser.username,
          name: backendUser.name ?? undefined,
          email: backendUser.email ?? undefined,
          role: backendUser.role,
          roles: [backendUser.role],
          provider: "backend",
        });

        router.replace("/user");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 401 || status === 400) {
          setError("Wrong username or password");
          return;
        }
      }

      setError("Login failed");
    }
  };

  return (
    <BgScreenWrapper>
      <Navbar
        roomId={roomCode}
        setRoomId={setRoomCode}
        username={roomUsername}
        setUsername={setRoomUsername}
        handleConnectSocket={connectToChatRoom}
        handleDisconnectSocket={disconnectFromChatRoom}
        isConnected={isConnected}
        hasPeer={hasPeer}
      />
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[globalStyles.container, globalStyles.centered]}>
          <View style={[globalStyles.card, { width: "100%", maxWidth: 420 }]}>
            <Text
              style={[
                globalStyles.title,
                { marginBottom: 20, textAlign: "center" },
              ]}
            >
              Login
            </Text>

            <TextInput
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              placeholderTextColor="rgba(255,255,255,0.5)"
              style={[globalStyles.input, { marginBottom: 12 }]}
            />

            <View style={{ position: "relative" }}>
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={[globalStyles.input, { marginBottom: 12 }]}
                placeholderTextColor="rgba(255,255,255,0.5)"
              />

              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: 12, top: "20%" }}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color={colors.secondary}
                />
              </Pressable>
            </View>

            {error && (
              <Text style={[globalStyles.error, { marginBottom: 10 }]}>
                {error}
              </Text>
            )}

            <Pressable style={globalStyles.primaryButton} onPress={handleLogin}>
              <Text style={globalStyles.primaryButtonText}>Login</Text>
            </Pressable>

            <Pressable onPress={() => router.push("/register")}>
              <Text style={[globalStyles.link, { marginTop: 12 }]}>
                Don't have an account? Register
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </BgScreenWrapper>
  );
};

export default Login;
