import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useContext, useState } from "react";
import { useRouter } from "expo-router";
import axios from "axios";
import { backendUrl } from "../constants/constants";
import BgScreenWrapper from "../components/layout/BgScreenWrapper";
import {
  frontendValidatePassword,
  frontEndValidateEmail,
} from "../authLogin/utils/registerBackend";
import { api } from "../authLogin/services/api";
import { createGlobalStyles } from "@/styles/global";
import { ThemeContext } from "@/context/ThemeContext";
import Navbar from "@/layout/Navbar";

const Register = () => {
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const handleRegister = async () => {
    setError(null);

    const passError = frontendValidatePassword(password);
    if (passError) {
      setError(passError);
      return;
    }

    const emailError = frontEndValidateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    if (!username || !name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(`${backendUrl}/auth/register-user`, {
        username,
        name,
        email,
        password,
      });

      if (response.data.status) {
        Alert.alert("Success", "Account created successfully");
        router.replace("/login");
      } else {
        setError(response.data.message || "Registration failed");
      }
    } catch (requestError: unknown) {
      if (!axios.isAxiosError(requestError)) {
        setError("Registration failed");
        return;
      }

      const responseData: unknown = requestError.response?.data;
      const backendMessage =
        typeof responseData === "object" &&
        responseData !== null &&
        "message" in responseData &&
        typeof responseData.message === "string"
          ? responseData.message
          : undefined;

      setError(backendMessage || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BgScreenWrapper>
      <Navbar />
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
      >
        <View style={globalStyles.container}>
          <View style={globalStyles.centered}>
            <View style={[globalStyles.card, { width: "100%", maxWidth: 420 }]}>
              <Text
                style={[
                  globalStyles.title,
                  { marginBottom: 20, textAlign: "center" },
                ]}
              >
                Register!
              </Text>

              <Text style={[globalStyles.text, { marginBottom: 4 }]}>Username</Text>
              <TextInput
                placeholder="Choose a username"
                value={username}
                onChangeText={setUsername}
                placeholderTextColor={colors.dimText}
                style={[globalStyles.input, { marginBottom: 12 }]}
              />
              <Text style={[globalStyles.text, { marginBottom: 4 }]}>Full Name</Text>
              <TextInput
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                placeholderTextColor={colors.dimText}
                style={[globalStyles.input, { marginBottom: 12 }]}
              />
              <Text style={[globalStyles.text, { marginBottom: 4 }]}>Email</Text>
              <TextInput
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor={colors.dimText}
                style={[globalStyles.input, { marginBottom: 12 }]}
                autoCapitalize="none"
              />
              <Text style={[globalStyles.text, { marginBottom: 4 }]}>Password</Text>
              <TextInput
                placeholder="Create a password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor={colors.dimText}
                style={[globalStyles.input, { marginBottom: 12 }]}
              />
              <Text style={[globalStyles.text, { marginBottom: 4 }]}>Confirm Password</Text>
              <TextInput
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                placeholderTextColor={colors.dimText}
                style={[globalStyles.input, { marginBottom: 12 }]}
              />

              {error && (
                <Text style={[globalStyles.error, { marginBottom: 10 }]}>
                  {error}
                </Text>
              )}

              <Pressable
                style={globalStyles.primaryButton}
                onPress={handleRegister}
              >
                <Text style={globalStyles.primaryButtonText}>
                  {loading ? "Loading..." : "Register"}
                </Text>
              </Pressable>

              <Pressable onPress={() => router.replace("/login")}>
                <Text style={[globalStyles.link, { marginTop: 12 }]}>
                  Already have an account? Login
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </BgScreenWrapper>
  );
};

export default Register;
