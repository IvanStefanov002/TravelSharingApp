import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect
import axios from "axios";
import * as ImagePicker from "expo-image-picker"; // Expo Image Picker
import React, { useCallback, useState } from "react";
import { Button, ScrollView, StatusBar, View } from "react-native";
import { baseAPIUrl } from "../../../components/shared";

import {
  Line,
  VehicleCard,
  VehicleContainer,
  VehicleImage,
  VehicleLabel,
  VehicleRow,
  VehicleTitle,
  VehicleValue,
} from "../../../components/styles";

const AboutVehicle = ({ route, navigation }) => {
  StatusBar.setHidden(false);

  const [vehicleInfo, setVehicleInfo] = useState({
    make: "",
    model: "",
    year: "",
    color: "",
    plate: "",
    mileage: "",
    fuelType: "",
    transmissionType: "",
    ratings: { average: 0, count: 0 },
    imageUrl: "", // To hold the image URI
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("FAILED");

  // Handle messages
  const handleMessage = (message, type = "FAILED") => {
    setMessage(message);
    setMessageType(type);
  };

  // Fetch vehicle information
  const fetchVehicleInfo = async (email) => {
    const url = `${baseAPIUrl}/users/fetchVehicleInfo`;

    try {
      const response = await axios.post(url, { email });
      const { statusText, message, data } = response.data;

      if (statusText !== "SUCCESS") {
        handleMessage(message, "FAILED");
      } else {
        const { car, ratings } = data[0];

        // const imageUrl = car.image_url.replace(
        //   "http://localhost:3000",
        //   baseAPIUrl
        // );

        const imageUrl = car.image_url;

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

  // Fetch data when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (route?.params?.email) {
        fetchVehicleInfo(route.params.email);
      }
    }, [route?.params?.email])
  );

  // Function to pick image from the gallery
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const imageUrl = result.assets[0].uri;
      setVehicleInfo((prevState) => ({ ...prevState, imageUrl }));

      // You can now upload this image to the server
      uploadImageToServer(imageUrl, "");
    } else {
      Alert.alert("You did not select any image.");
    }
  };

  const changeImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const imageFileName = vehicleInfo.imageUrl.split("/").pop();
      const newImageUrl = result.assets[0].uri;
      setVehicleInfo((prevState) => ({ ...prevState, newImageUrl }));

      // You can now upload this image to the server
      uploadImageToServer(newImageUrl, imageFileName);
    } else {
      Alert.alert("You did not select any image.");
    }
  };

  // Function to upload the image to your server
  const uploadImageToServer = async (imageUrl, imageFileName) => {
    const formData = new FormData();
    const uriParts = imageUrl.split(".");
    const fileType = uriParts[uriParts.length - 1]; // Get file extension

    const response = await fetch(imageUrl);
    const blob = await response.blob();

    formData.append("email", route?.params?.email);
    formData.append("oldImage", imageFileName);
    formData.append("image", {
      uri: imageUrl,
      name: `vehicle_image.${fileType}`,
      type: `image/${fileType}`,
    });

    try {
      const response = await axios.post(
        `${baseAPIUrl}/upload/image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.statusText === "SUCCESS") {
        handleMessage("Image uploaded successfully", "SUCCESS");

        /* swap localhost with actual ip */
        // const imageUrl = response.data.imageUrl.replace(
        //   "http://localhost:3000",
        //   baseAPIUrl
        // );
        const imageUrl = response.data.imageUrl;

        updateVehicleImageUrl(imageUrl);
      } else {
        handleMessage("Image upload failed", "FAILED");
      }
    } catch (error) {
      console.error("Upload error:", error);
      handleMessage("Image upload error", "FAILED");
    }
  };

  // Function to update the vehicle info with the image URL
  const updateVehicleImageUrl = (imageUrl) => {
    setVehicleInfo((prevState) => ({
      ...prevState,
      imageUrl: imageUrl,
    }));

    // Optionally update this on the server as well, if needed
    // Example: You can send a PUT request to update the vehicle info
  };

  return (
    <ScrollView>
      <VehicleContainer>
        <View
          style={{
            alignItems: "center",
          }}
        >
          <VehicleTitle>Vehicle Information</VehicleTitle>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            //alignItems: "center", // Centers the image and button horizontally
          }}
        >
          {vehicleInfo.imageUrl ? (
            <VehicleImage
              source={{ uri: `${baseAPIUrl}${vehicleInfo.imageUrl}` }}
              style={{
                width: "100%", // Make the image take up max width
                maxWidth: 320, // Set max width to 300 or any desired value
                aspectRatio: 2, // Define aspect ratio (width:height ratio) for rectangular shape
              }}
            />
          ) : (
            <VehicleImage
              source={require("../../../assets/images/logo.png")}
              style={{
                width: "100%",
                maxWidth: 300,
                aspectRatio: 2,
              }}
            />
          )}
        </View>

        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
          }}
        >
          {!vehicleInfo.imageUrl || vehicleInfo.imageUrl === "logo.png" ? (
            <Button title="Add Image" onPress={pickImage} />
          ) : (
            <>
              <Button title="Change Image" onPress={changeImage} />
              <Button title="Delete Image" onPress={changeImage} />
            </>
          )}
        </View>

        <VehicleCard>
          <VehicleRow>
            <VehicleLabel>Make:</VehicleLabel>
            <VehicleValue>{vehicleInfo.make}</VehicleValue>
          </VehicleRow>

          <VehicleRow>
            <VehicleLabel>Model:</VehicleLabel>
            <VehicleValue>{vehicleInfo.model}</VehicleValue>
          </VehicleRow>

          <VehicleRow>
            <VehicleLabel>Year:</VehicleLabel>
            <VehicleValue>{vehicleInfo.year}</VehicleValue>
          </VehicleRow>

          <VehicleRow>
            <VehicleLabel>Color:</VehicleLabel>
            <VehicleValue>{vehicleInfo.color}</VehicleValue>
          </VehicleRow>

          <VehicleRow>
            <VehicleLabel>Plate:</VehicleLabel>
            <VehicleValue>{vehicleInfo.plate}</VehicleValue>
          </VehicleRow>

          <VehicleRow>
            <VehicleLabel>Mileage:</VehicleLabel>
            <VehicleValue>{vehicleInfo.mileage} km</VehicleValue>
          </VehicleRow>

          <VehicleRow>
            <VehicleLabel>Fuel Type:</VehicleLabel>
            <VehicleValue>{vehicleInfo.fuelType}</VehicleValue>
          </VehicleRow>

          <VehicleRow>
            <VehicleLabel>Transmission:</VehicleLabel>
            <VehicleValue>{vehicleInfo.transmissionType}</VehicleValue>
          </VehicleRow>

          <Line />

          <VehicleLabel>Average rating:</VehicleLabel>
          <VehicleValue>{vehicleInfo.ratings.average}</VehicleValue>

          <VehicleLabel>Ratings count:</VehicleLabel>
          <VehicleValue>{vehicleInfo.ratings.count}</VehicleValue>
        </VehicleCard>
      </VehicleContainer>
    </ScrollView>
  );
};

export default AboutVehicle;
