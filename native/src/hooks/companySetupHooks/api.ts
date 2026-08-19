import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "@/authLogin/services/api";

export const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");

  return {
    headers: {
      Authorization: `Bearer ${token ?? ""}`,
    },
  };
};

export { api };
