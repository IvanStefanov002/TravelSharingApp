import { baseAPIUrl } from "@/components/shared";
import axios from "axios";

/* id = trip_id */
export const updateTripStatus = async (id, status) => {
  const payload = { id, status };

  try {
    const response = await axios.post(
      `${baseAPIUrl}/trips/updateStatus`,
      payload
    );

    if (response.status === 200 || response.status === 201) {
      return {
        success: true,
        message: "Trip status updated successfully.",
        data: response.data,
      };
    }
  } catch (error) {
    console.error("Error updating trip:", error.message);
    return {
      success: false,
      message: "Failed to update trip status. Please try again later.",
    };
  }

  return {
    success: false,
    message: "Unexpected error occurred.",
  };
};
