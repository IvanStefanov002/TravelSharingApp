import { baseAPIUrl } from "@/components/shared";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const fetchGoogleApiKey = async () => {
  try {
    const token = await AsyncStorage.getItem("token");

    if (!token) {
      console.warn("JWT token not found in storage.");
      return null;
    }

    const response = await axios.get(
      `${baseAPIUrl}/configurations/fetchGoogleAPIKey`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response?.data?.google_api_key) {
      return response.data.google_api_key;
    } else {
      console.warn("Google API key not found in response.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching Google API key:", error.message);
    return null;
  }
};
