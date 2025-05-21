import { baseAPIUrl } from "@/components/shared";
import axios from "axios";

export const updateUserRating = async (
  driverId,
  newAverageRating,
  newCount
) => {
  const formData = new FormData();

  formData.append("id", driverId);
  formData.append("newAverageRating", newAverageRating);
  formData.append("newCount", newCount);

  console.log(formData);

  const response = await axios.post(
    `${baseAPIUrl}/users/updateRatings`,
    formData,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.statusText;
};
