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
        message: "Успешно обновен статус на пътуването.",
        data: response.data,
      };
    }
  } catch (error) {
    console.error("Error updating trip:", error.message);
    return {
      success: false,
      message: "Грешка при обновяването на статуса на пътуването.",
    };
  }

  return {
    success: false,
    message: "Unexpected error occurred.",
  };
};
