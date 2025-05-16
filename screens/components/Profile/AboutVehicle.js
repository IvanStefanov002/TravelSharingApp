import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect
import axios from "axios";
import React, { useCallback, useState } from "react";
import { Button, ScrollView, StatusBar, View } from "react-native";
import { baseAPIUrl } from "../../../components/shared";
import {
  changeImage,
  deleteImage,
  pickImage,
} from "./../../../utils/imageHandlers";
import { handleMessage } from "./../../../utils/messages";

import {
  Line,
  VehicleCard,
  VehicleContainer,
  VehicleImage,
  VehicleLabel,
  VehicleRow,
  VehicleValue,
} from "../../../components/styles";

const AboutVehicle = ({ route, navigation }) => {
  StatusBar.setHidden(true);

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

  // Fetch vehicle information
  const fetchVehicleInfo = async (email) => {
    const url = `${baseAPIUrl}/users/fetchVehicleInfo`;

    try {
      const response = await axios.post(url, { email });
      const { statusText, message, data } = response.data;

      if (statusText !== "SUCCESS") {
        handleMessage(setMessage, setMessageType, message, "FAILED");
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

  // Fetch data when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (route?.params?.email) {
        fetchVehicleInfo(route.params.email);
      }
    }, [route?.params?.email])
  );

  return (
    <ScrollView>
      <VehicleContainer>
        <View
          style={{
            alignItems: "center",
          }}
        ></View>
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            //alignItems: "center", // Centers the image and button horizontally
          }}
        >
          {vehicleInfo.imageUrl ? (
            <VehicleImage
              source={{ uri: vehicleInfo.imageUrl }}
              style={{
                width: "100%", // Make the image take up max width
                maxWidth: 320, // Set max width to 300 or any desired value
                aspectRatio: 2, // Define aspect ratio (width:height ratio) for rectangular shape
              }}
            />
          ) : (
            <VehicleImage
              source={require("../../../assets/images/no_image.jpeg")}
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
          {!vehicleInfo.imageUrl ||
          vehicleInfo.imageUrl === `${baseAPIUrl}/uploads/no_image.jpeg` ? (
            <Button
              title="Add Image"
              onPress={() =>
                pickImage(setVehicleInfo, route, setMessage, setMessageType)
              }
            />
          ) : (
            <>
              <Button
                title="Change Image"
                onPress={() =>
                  changeImage(
                    vehicleInfo,
                    setVehicleInfo,
                    route,
                    setMessage,
                    setMessageType
                  )
                }
              />
              <Button
                title="Delete Image"
                onPress={() =>
                  deleteImage(
                    vehicleInfo.imageUrl,
                    route?.params?.email,
                    setMessage,
                    setMessageType,
                    setVehicleInfo
                  )
                }
              />
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
