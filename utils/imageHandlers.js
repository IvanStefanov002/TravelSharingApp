import { baseAPIUrl } from "@/components/shared";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { handleMessage } from "./messages";
import { uploadCarImageToServer, uploadImageToServer } from "./uploadImage";

/* Handles picking a new image and uploading it for a car */
export const pickImageCar = async (
  vehicle,
  onVehicleUpdated,
  route,
  setMessage,
  setMessageType
) => {
  console.log("PickImageCar start...");
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const newImageUrl = result.assets[0].uri;
      const imageFileName = vehicle.imageUrl?.split("/")?.pop() || "";

      // Optimistic update
      const tempVehicle = { ...vehicle, imageUrl: newImageUrl };
      onVehicleUpdated(tempVehicle);

      // Upload image
      const uploadedImageUrl = await uploadCarImageToServer(
        vehicle.plate,
        newImageUrl,
        imageFileName,
        route?.params?.email,
        setMessage,
        setMessageType,
        () => {} // no-op, handled manually
      );

      // Final update with actual uploaded image URL
      const updatedVehicle = { ...vehicle, imageUrl: uploadedImageUrl };
      onVehicleUpdated(updatedVehicle);
    } else {
      Alert.alert("You did not select any image.");
    }
  } catch (error) {
    console.error("Error picking image:", error);
    Alert.alert("An error occurred while picking the image.");
    return false;
  }

  return true;
};

/**
 * Handles picking a new image and uploading it.
 */
export const pickImage = async (
  setVehicleInfo,
  route,
  setMessage,
  setMessageType
) => {
  console.log("PickImage start...");
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

    return false;
  }

  return true;
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
  console.log("ChangeImage start...");

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const imageFileName = vehicleInfo.imageUrl.split("/").pop();
      const newImageUrl = result.assets[0].uri;
      setVehicleInfo((prev) => ({ ...prev, imageUrl: newImageUrl }));

      const uploadedImageUrl = await uploadImageToServer(
        newImageUrl,
        imageFileName,
        route?.params?.email,
        setMessage,
        setMessageType,
        setVehicleInfo
      );

      vehicleInfo.imageUrl = uploadedImageUrl;
    } else {
      Alert.alert("You did not select any image.");
    }
  } catch (error) {
    console.error("Error changing image:", error);
    Alert.alert("An error occurred while changing the image.");

    return false;
  }

  return true;
};

export const changeImageCar = async (
  vehicleInfo,
  setVehicleInfo,
  route,
  setMessage,
  setMessageType
) => {
  console.log("ChangeImageCar start...");

  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const imageFileName = vehicleInfo.imageUrl.split("/").pop();
      const newImageUrl = result.assets[0].uri;
      setVehicleInfo((prev) => ({ ...prev, imageUrl: newImageUrl }));

      const uploadedImageUrl = await uploadCarImageToServer(
        vehicleInfo.plate,
        newImageUrl,
        imageFileName,
        route?.params?.email,
        setMessage,
        setMessageType,
        setVehicleInfo
      );

      vehicleInfo.imageUrl = uploadedImageUrl;
    } else {
      Alert.alert("You did not select any image.");
    }
  } catch (error) {
    console.error("Error changing image:", error);
    Alert.alert("An error occurred while changing the image.");

    return false;
  }

  return true;
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
        imageUrl: "",
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
