import axios from "axios";
import { baseAPIUrl } from "../components/shared";

export const fetchVehicleInfo = async (
  email,
  setVehicleInfo,
  handleMessage
) => {
  const url = `${baseAPIUrl}/users/fetchVehicleInfo`;

  try {
    const response = await axios.post(url, { email });
    const { statusText, message, data } = response.data;

    if (statusText !== "SUCCESS") {
      handleMessage(message, "FAILED");
    } else {
      const { car, ratings } = data[0];
      const imageUrl = car.image_url.replace(
        "http://localhost:3000",
        baseAPIUrl
      );

      setVehicleInfo({
        make: car.make,
        model: car.model,
        year: car.year,
        color: car.color,
        plate: car.plate,
        mileage: car.mileage,
        fuelType: car.fuel_type,
        transmissionType: car.transmission,
        ratings: ratings ?? { average: 0, count: 0 },
        imageUrl: imageUrl || "",
      });

      handleMessage("Vehicle info loaded", "SUCCESS");
    }
  } catch (error) {
    console.error("Fetch error:", error);
    handleMessage(
      error.response?.data?.message || "Fetch vehicle info failed",
      "FAILED"
    );
  }
};
