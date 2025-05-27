import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native"; // Import useFocusEffect
import React, { useCallback, useState } from "react";
import { Button, ScrollView, StatusBar, View } from "react-native";
import { baseAPIUrl } from "../../../components/shared";

import {
  changeImageCar,
  deleteImage,
  pickImageCar,
} from "./../../../utils/imageHandlers";

import { handleMessage } from "@/utils/messages";

import { fetchVehicleInfo } from "@/utils/fetchVehicleInfo";
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

  const [vehicleInfo, setVehicleInfo] = useState([]); // all vehicles
  const [selectedVehicle, setSelectedVehicle] = useState(null); // selected one

  const [message, setMessage] = useState("DEFAULT");
  const [messageType, setMessageType] = useState("DEFAULT");

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        if (route?.params?.email) {
          await fetchVehicleInfo(
            route.params.email,
            setVehicleInfo,
            setMessage,
            setMessageType,
            handleMessage
          );
        }
      };

      fetchData();
      setVehicleInfo(vehicleInfo);
      setSelectedVehicle(vehicleInfo[0]); /* default to the first vehicle */

      // Optional: return cleanup function if needed
      return () => {};
    }, [route?.params?.email])
  );

  return (
    <ScrollView>
      <VehicleContainer>
        {/* Vehicle Selection Picker Buttons */}
        <View style={{ padding: 10 }}>
          <Picker
            selectedValue={selectedVehicle?.plate || ""}
            onValueChange={(itemValue) => {
              if (!itemValue) {
                setSelectedVehicle(null);
                return;
              }
              const selected = vehicleInfo.find((v) => v.plate === itemValue);
              setSelectedVehicle(selected);
            }}
            style={{ height: 50, width: "100%" }}
          >
            <Picker.Item label="Select vehicle..." value="" color="#888" />
            {vehicleInfo.map((vehicle) => (
              <Picker.Item
                key={vehicle.plate}
                label={`${vehicle.make} ${vehicle.model}`}
                value={vehicle.plate}
              />
            ))}
          </Picker>
        </View>

        {/* Selected Vehicle Details */}
        {selectedVehicle ? (
          <>
            <View style={{ alignItems: "center" }}>
              {selectedVehicle?.imageUrl ? (
                <VehicleImage
                  source={{ uri: `${baseAPIUrl}${selectedVehicle.imageUrl}` }}
                  style={{
                    width: "100%",
                    maxWidth: 320,
                    aspectRatio: 2,
                    backgroundColor: "lightgray",
                  }}
                  resizeMode="contain"
                />
              ) : (
                <VehicleImage
                  source={require("../../../assets/images/no_image.jpeg")}
                  style={{
                    width: "100%",
                    maxWidth: 300,
                    aspectRatio: 2,
                    backgroundColor: "lightgray",
                  }}
                  resizeMode="contain"
                />
              )}
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-around",
                marginVertical: 10,
              }}
            >
              {!selectedVehicle.imageUrl ||
              selectedVehicle.imageUrl.includes("no_image") ? (
                <Button
                  title="Add Image"
                  onPress={() =>
                    pickImageCar(
                      selectedVehicle,
                      (updatedVehicle) => {
                        const updated = vehicleInfo.map((v) =>
                          v.plate === updatedVehicle.plate ? updatedVehicle : v
                        );
                        setVehicleInfo(updated);
                        setSelectedVehicle(updatedVehicle);
                      },
                      route,
                      setMessage,
                      setMessageType
                    )
                  }
                />
              ) : (
                <>
                  <Button
                    title="Change Image"
                    onPress={() =>
                      changeImageCar(
                        selectedVehicle,
                        (updatedVehicle) => {
                          const updated = vehicleInfo.map((v) =>
                            v.plate === updatedVehicle.plate
                              ? updatedVehicle
                              : v
                          );
                          setVehicleInfo(updated);
                          setSelectedVehicle(updatedVehicle);
                        },
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
                        selectedVehicle.imageUrl,
                        route?.params?.email,
                        setMessage,
                        setMessageType,
                        (newImageUrl) => {
                          const updated = vehicleInfo.map((v) =>
                            v.plate === selectedVehicle.plate
                              ? { ...v, imageUrl: newImageUrl }
                              : v
                          );
                          setVehicleInfo(updated);
                          setSelectedVehicle((prev) => ({
                            ...prev,
                            imageUrl: newImageUrl,
                          }));
                        }
                      )
                    }
                  />
                </>
              )}
            </View>

            <VehicleCard>
              <VehicleRow>
                <VehicleLabel>Make:</VehicleLabel>
                <VehicleValue>{selectedVehicle.make}</VehicleValue>
              </VehicleRow>
              <VehicleRow>
                <VehicleLabel>Model:</VehicleLabel>
                <VehicleValue>{selectedVehicle.model}</VehicleValue>
              </VehicleRow>
              <VehicleRow>
                <VehicleLabel>Year:</VehicleLabel>
                <VehicleValue>{selectedVehicle.year}</VehicleValue>
              </VehicleRow>
              <VehicleRow>
                <VehicleLabel>Color:</VehicleLabel>
                <VehicleValue>{selectedVehicle.color}</VehicleValue>
              </VehicleRow>
              <VehicleRow>
                <VehicleLabel>Plate:</VehicleLabel>
                <VehicleValue>{selectedVehicle.plate}</VehicleValue>
              </VehicleRow>
              <Line />
            </VehicleCard>
          </>
        ) : (
          <VehicleCard>
            <VehicleRow>
              <VehicleLabel>No vehicle selected.</VehicleLabel>
            </VehicleRow>
          </VehicleCard>
        )}
      </VehicleContainer>
    </ScrollView>
  );
};

export default AboutVehicle;
