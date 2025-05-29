import { baseAPIUrl } from "@/components/shared";
import axios from "axios";

export const fetchUserDataById = async (id) => {
  if (!id) return null;

  try {
    const response = await axios.get(`${baseAPIUrl}/users/${id}`);
    const userData = response.data;

    /* correct image_url before returning */
    if (userData?.car?.image_url) {
      userData.car.image_url = userData.car.image_url;
    }

    return userData;
  } catch (error) {
    console.error("Error fetching driver details:", error.message);
    return null;
  }
};
