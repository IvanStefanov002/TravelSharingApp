import { baseAPIUrl } from "@/components/shared";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const fetchClientIds = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      console.warn("JWT token not found in storage.");
      return null;
    }

    const response = await axios.get(
      `${baseAPIUrl}/configurations/fetchClientIds`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (
      response?.data?.android_client_id &&
      response?.data?.ios_client_id &&
      response?.data?.web_client_id
    ) {
      return response.data;
    } else {
      console.warn("Client ids are not found in the response.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching Client ids:", error.message);
    return null;
  }
};
