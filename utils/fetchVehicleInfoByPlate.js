import axios from "axios";
import { baseAPIUrl } from "../components/shared";

export const fetchVehicleInfoByPlate = async (
  email,
  plate,
  setVehicleInfo,
  setMessage,
  setMessageType,
  handleMessage
) => {
  const url = `${baseAPIUrl}/users/fetchVehicleInfoByPlate`;

  try {
    const response = await axios.post(url, { email, plate });
    const { statusText, message, data } = response.data;

    if (statusText !== "SUCCESS") {
      handleMessage(setMessage, setMessageType, message, "FAILED");
    } else {
      const vehicles = data[0].vehicles;

      console.log(`vehicles`, vehicles);

      setVehicleInfo(vehicles);
      handleMessage(
        setMessage,
        setMessageType,
        "Vehicle info loaded",
        "SUCCESS"
      );
    }
  } catch (error) {
    console.error("Fetch error:", error);
    handleMessage(
      setMessage,
      setMessageType,
      error.response?.data?.message || "Fetch vehicle info failed",
      "FAILED"
    );
  }
};
