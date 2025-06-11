import { baseAPIUrl } from "@/components/shared";
import axios from "axios";
import { uploadTripImageToServer } from "./uploadImage";

export const createTrip = async (tripData, setMessage, setMessageType) => {
  try {
    /* first upload the image to the server */
    const correctImageUrl = await uploadTripImageToServer(
      tripData.vehicle_image,
      "",
      setMessage,
      setMessageType
    );
    /* uploadTripImageToServer has corrected the image url with the correct */
    tripData.vehicle_image = correctImageUrl;

    const response = await axios.post(`${baseAPIUrl}/trips/create`, tripData);

    if (response.status === 200 || response.status === 201) {
      setMessage("Trip successfully created!");
      setMessageType("SUCCESS");
      return true;
    } else {
      setMessage("Failed to create trip.");
      setMessageType("FAILED");
      return false;
    }
  } catch (error) {
    console.error("Error creating trip:", error.message);
    setMessage("Error creating trip.");
    setMessageType("FAILED");
    return false;
  }
};
