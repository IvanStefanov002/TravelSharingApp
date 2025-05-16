import { baseAPIUrl } from "@/components/shared";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { handleMessage } from "./messages";
import { uploadImageToServer } from "./uploadImage";

/**
 * Handles picking a new image and uploading it.
 */
export const pickImage = async (
  setVehicleInfo,
  route,
  setMessage,
  setMessageType
) => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUrl = result.assets[0].uri;
      setVehicleInfo((prev) => ({ ...prev, imageUrl }));

      await uploadImageToServer(
        imageUrl,
        "",
        route?.params?.email,
        setMessage,
        setMessageType,
        setVehicleInfo
      );
    } else {
      Alert.alert("You did not select any image.");
    }
  } catch (error) {
    console.error("Error picking image:", error);
    Alert.alert("An error occurred while picking the image.");
  }
};

export const pickImageTrip = async (
  setTripData,
  setImageName,
  setMessage,
  setMessageType
) => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      const uriParts = imageUri.split("/");
      const fileName = uriParts[uriParts.length - 1];

      // Set the filename in the component
      setImageName(fileName);

      // Update trip data
      setTripData((prev) => ({
        ...prev,
        vehicle_image: imageUri,
      }));
    } else {
      Alert.alert("You did not select any image.");
    }
  } catch (error) {
    console.error("Error picking image:", error);
    Alert.alert("An error occurred while picking the image.");
  }
};

/*
export const pickImage = async (
  updateImageState, // this will be a callback like setVehicleInfo or setTripData mapper
  route,
  setMessage,
  setMessageType
) => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUrl = result.assets[0].uri;

      console.log(imageUrl);
      // Let the caller define how to update their state
      updateImageState(imageUrl);

      await uploadImageToServer(
        imageUrl,
        "",
        route?.params?.email,
        setMessage,
        setMessageType,
        updateImageState
      );
    } else {
      Alert.alert("You did not select any image.");
    }
  } catch (error) {
    console.error("Error picking image:", error);
    Alert.alert("An error occurred while picking the image.");
  }
};
*/

/**
 * Handles replacing an existing image and uploading the new one.
 */
export const changeImage = async (
  vehicleInfo,
  setVehicleInfo,
  route,
  setMessage,
  setMessageType
) => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const imageFileName = vehicleInfo.imageUrl.split("/").pop();
      const newImageUrl = result.assets[0].uri;
      setVehicleInfo((prev) => ({ ...prev, imageUrl: newImageUrl }));

      await uploadImageToServer(
        newImageUrl,
        imageFileName,
        route?.params?.email,
        setMessage,
        setMessageType,
        setVehicleInfo
      );
    } else {
      Alert.alert("You did not select any image.");
    }
  } catch (error) {
    console.error("Error changing image:", error);
    Alert.alert("An error occurred while changing the image.");
  }
};

/**
 * Handles deleting an exisiting image
 */
export const deleteImage = async (
  imageUrl,
  email,
  setMessage,
  setMessageType,
  setVehicleInfo
) => {
  const imageFileName = imageUrl.split("/").pop();

  try {
    const response = await axios.post(`${baseAPIUrl}/upload/delete/carImage`, {
      email,
      image: imageFileName,
    });

    if (response.data.statusText === "SUCCESS") {
      setVehicleInfo((prev) => ({
        ...prev,
        imageUrl: "", // Clear the image from local state
      }));

      handleMessage(
        setMessage,
        setMessageType,
        "Image deleted successfully",
        "SUCCESS"
      );
    } else {
      handleMessage(
        setMessage,
        setMessageType,
        "Image deletion failed",
        "FAILED"
      );
    }
  } catch (error) {
    console.error("Delete error:", error);
    handleMessage(
      setMessage,
      setMessageType,
      "An error occurred while deleting the image",
      "FAILED"
    );
  }
};
