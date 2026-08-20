import { useContext, useState } from "react";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import axios from "axios";

import { handleLogout } from "@/authLogin/authFunctions";
import { UserAuthContext } from "@/authLogin/context/UserAuthContext";
import { api } from "@/authLogin/services/api";
import { backendUrl } from "@/constants/constants";
import { ThemeContext } from "@/context/ThemeContext";
import { createGlobalStyles } from "@/styles/global";

const DeleteAccountButton = () => {
  const { user, setUser } = useContext(UserAuthContext);
  const { colors } = useContext(ThemeContext);
  const globalStyles = createGlobalStyles(colors);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const isAdmin = user?.roles.includes("ADMIN") === true;

  if (!isAdmin || !user) {
    return null;
  }

  const handleOpen = () => {
    setCurrentPassword("");
    setError("");
    setIsModalVisible(true);
  };

  const handleClose = () => {
    if (!isDeleting) {
      setIsModalVisible(false);
    }
  };

  const handleDelete = async () => {
    if (!currentPassword.trim()) {
      setError("Enter your current password.");
      return;
    }

    setError("");
    setIsDeleting(true);

    try {
      // console.log('DELETE ACCOUNT request', {
      //   userId: user.id,
      //   // currentPassword,
      //   passwordLength: currentPassword.length,
      //   hasOuterWhitespace: currentPassword !== currentPassword.trim(),
      // });

      const response = await api.delete(backendUrl + "/users/" + user.id, {
        data: {
          currentPassword,
        },
      });

      // console.log('DELETE ACCOUNT response', {
      //   status: response.status,
      //   data: response.data,
      // });

      setIsModalVisible(false);
      await handleLogout(setUser);
      router.replace("/");
    } catch (requestError) {

      // console.log('DELETE ACCOUNT error', {
      //   isAxiosError: axios.isAxiosError(requestError),
      //   status: axios.isAxiosError(requestError)
      //     ? requestError.response?.status
      //     : undefined,
      //   data: axios.isAxiosError(requestError)
      //     ? requestError.response?.data
      //     : undefined,
      // });

      if (
        axios.isAxiosError(requestError) &&
        requestError.response?.status === 401
      ) {
        setError("The current password is incorrect.");
      } else {
        setError("Account deletion failed. Please try again.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Pressable
        onPress={handleOpen}
        style={[
          globalStyles.primaryButton,
          {
            backgroundColor: colors.alert,
            alignSelf: "center",
            width: "60%",
            maxWidth: 220,
          },
        ]}
      >
        <Text style={{ color: "#ffffff", fontWeight: "600", fontSize: 14 }}>
          Delete Account
        </Text>
      </Pressable>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            padding: 20,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
          }}
        >
          <View style={[globalStyles.card, { width: "100%" }]}>
            <Text style={globalStyles.title}>Delete Account</Text>
            <Text style={[globalStyles.text, { marginBottom: 16 }]}>
              This permanently deletes your ADMIN account and removes its
              organization memberships. Companies, STAFF accounts, and
              operational data remain on the backend.
            </Text>

            {error ? (
              <Text style={[globalStyles.error, { marginBottom: 12 }]}>
                {error}
              </Text>
            ) : null}

            <TextInput
              autoFocus
              placeholder="Current password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              editable={!isDeleting}
              style={globalStyles.input}
            />

            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <Pressable
                onPress={handleClose}
                disabled={isDeleting}
                style={globalStyles.secondaryButton}
              >
                <Text style={globalStyles.secondaryButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => void handleDelete()}
                disabled={isDeleting}
                style={[
                  globalStyles.primaryButton,
                  { backgroundColor: colors.alert, marginLeft: 12 },
                ]}
              >
                <Text style={globalStyles.primaryButtonText}>
                  {isDeleting ? "Deleting..." : "Delete Account"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default DeleteAccountButton;
