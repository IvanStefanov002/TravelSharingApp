import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import ResponsiveImage from "@/components/ResponsiveImage";
import { baseAPIUrl } from "@/components/shared";
import { fetchVehicleInfo } from "@/utils/fetchVehicleInfo";
import { handleMessage } from "@/utils/messages";
import axios from "axios";
import {
  Line,
  VehicleCard,
  VehicleContainer,
  VehicleImage,
  VehicleLabel,
  VehicleRow,
  VehicleValue,
} from "../../../components/styles";
import {
  changeImageCar,
  deleteImage,
  pickImageCar,
} from "./../../../utils/imageHandlers";

const AboutVehicle = ({ route, navigation }) => {
  StatusBar.setHidden(true);

  const [loading, setLoading] = useState(true);

  const [vehicleInfo, setVehicleInfo] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleImageUrl, setVehicleImageUrl] = useState("");

  const [message, setMessage] = useState("DEFAULT");
  const [messageType, setMessageType] = useState("DEFAULT");

  const [manualVehicle, setManualVehicle] = useState({
    make: "",
    model: "",
    year: "",
    color: "",
    plate: "",
  });

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
      setSelectedVehicle((prev) => vehicleInfo[0] || null);

      return () => {};
    }, [route?.params?.email])
  );

  /* Update image URL when vehicle changes */
  useEffect(() => {
    if (selectedVehicle?.imageUrl) {
      setVehicleImageUrl(selectedVehicle.imageUrl);
    } else {
      setVehicleImageUrl("/uploads/no_image.jpeg");
      setLoading(false);
    }
  }, [selectedVehicle]);

  const addVehicleToUser = async (email, vehicle) => {
    try {
      const response = await axios.post(`${baseAPIUrl}/users/addVehicle`, {
        email,
        vehicle,
      });

      if (!response.data.statusText === "SUCCESS") {
        return {
          success: false,
          message:
            response.data.message || "Неуспешно добавяне на превозно средство",
        };
      }

      return { success: true, message: "Превозното средство е добавено" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const removeVehicleFromUser = async (email, plate) => {
    try {
      const response = await axios.post(`${baseAPIUrl}/users/removeVehicle`, {
        email,
        plate,
      });

      if (!response.data.statusText === "SUCCESS") {
        return {
          success: false,
          message:
            response.data.message ||
            "Неуспешно премахване на превозно средство",
        };
      }

      return { success: true, message: "Превозното средство е премахнато" };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  return (
    <ScrollView>
      <VehicleContainer>
        {/* SECTION 1: Add Vehicle Form */}
        <View
          style={{
            marginBottom: 20,
            padding: 10,
            backgroundColor: "lightgray",
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 10,
              alignSelf: "center",
            }}
          >
            Добави превозно средство
          </Text>

          <TextInput
            placeholder="Марка"
            value={manualVehicle.make}
            onChangeText={(text) =>
              setManualVehicle((prev) => ({ ...prev, make: text }))
            }
            style={inputStyle}
          />
          <TextInput
            placeholder="Модел"
            value={manualVehicle.model}
            onChangeText={(text) =>
              setManualVehicle((prev) => ({ ...prev, model: text }))
            }
            style={inputStyle}
          />
          <TextInput
            placeholder="Година"
            value={manualVehicle.year}
            onChangeText={(text) =>
              setManualVehicle((prev) => ({ ...prev, year: text }))
            }
            style={inputStyle}
          />
          <TextInput
            placeholder="Цвят"
            value={manualVehicle.color}
            onChangeText={(text) =>
              setManualVehicle((prev) => ({ ...prev, color: text }))
            }
            style={inputStyle}
          />
          <TextInput
            placeholder="Рег. номер"
            value={manualVehicle.plate}
            onChangeText={(text) =>
              setManualVehicle((prev) => ({ ...prev, plate: text }))
            }
            style={inputStyle}
          />

          <TouchableOpacity
            style={{
              backgroundColor: "#10b981",
              paddingVertical: 12,
              borderRadius: 6,
              marginTop: 10,
            }}
            onPress={async () => {
              // Check if any field is empty
              const { make, model, year, color, plate } = manualVehicle;
              if (!make || !model || !year || !color || !plate) {
                Alert.alert("Грешка", "Моля, попълнете всички полета.");
                return;
              }

              const result = await addVehicleToUser(
                route?.params?.email,
                manualVehicle
              );

              if (result.success) {
                Alert.alert("Успешно", result.message);
                setManualVehicle({
                  make: "",
                  model: "",
                  year: "",
                  color: "",
                  plate: "",
                });

                // Re-fetch vehicles
                await fetchVehicleInfo(
                  route.params.email,
                  setVehicleInfo,
                  setMessage,
                  setMessageType,
                  handleMessage
                );
              } else {
                Alert.alert("Грешка", result.message);
              }
            }}
          >
            <Text
              style={{ color: "white", textAlign: "center", fontWeight: "600" }}
            >
              Добави
            </Text>
          </TouchableOpacity>
        </View>

        <Line></Line>

        {/* SECTION 2: Select + Display Vehicle Info */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: 600,
            marginBottom: 5,
            alignSelf: "center",
          }}
        >
          Моите превозни средства
        </Text>

        <View
          style={{
            padding: 0,
            backgroundColor: "lightgray",
            marginVertical: 10,
            borderRadius: 12,
            borderWidth: 0.1,
          }}
        >
          <Picker
            selectedValue={selectedVehicle?.plate || ""}
            onValueChange={(itemValue) => {
              const selected = vehicleInfo.find((v) => v.plate === itemValue);
              setSelectedVehicle(selected || null);
            }}
            style={{ height: 60, width: "100%" }}
          >
            <Picker.Item
              label="Избери превозно средство..."
              value=""
              color="#888"
            />
            {vehicleInfo.map((vehicle) => (
              <Picker.Item
                key={vehicle.plate}
                label={`${vehicle.make} ${vehicle.model}`}
                value={vehicle.plate}
              />
            ))}
          </Picker>
        </View>

        {/* Vehicle Image */}
        {selectedVehicle ? (
          <>
            <View style={{ alignItems: "center" }}>
              {vehicleImageUrl ? (
                <View style={{ width: "100%", borderRadius: 12 }}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#999" />
                  ) : (
                    <ResponsiveImage
                      imageUrl={`${baseAPIUrl}${vehicleImageUrl}`}
                      style={{
                        borderRadius: 12,
                        borderWidth: 0.1,
                        borderStyle: "solid",
                      }}
                    />
                  )}
                </View>
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

            {/* Image Buttons */}
            <View
              style={{
                marginVertical: 10,
                width: 250,
                alignSelf: "center",
              }}
            >
              {!vehicleImageUrl || vehicleImageUrl.includes("no_image") ? (
                <TouchableOpacity
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
                  style={{
                    backgroundColor: "#10b981",
                    paddingVertical: 12,
                    borderRadius: 6,
                    marginTop: 10,
                  }}
                >
                  <Text
                    style={{
                      color: "white",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Добави
                  </Text>
                </TouchableOpacity>
              ) : (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    gap: 10,
                    marginTop: 10,
                    alignSelf: "center",
                    width: 300,
                  }}
                >
                  <TouchableOpacity
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
                    style={{
                      flex: 1,
                      backgroundColor: "#10b981",
                      paddingVertical: 10,
                      borderRadius: 6,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      Промени
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      deleteImage(
                        vehicleImageUrl,
                        route?.params?.email,
                        selectedVehicle.plate,
                        setMessage,
                        setMessageType,
                        (newImageUrl) => {
                          const updated = vehicleInfo.map((v) =>
                            v.plate === selectedVehicle.plate
                              ? { ...v, imageUrl: newImageUrl }
                              : v
                          );
                          setVehicleImageUrl(newImageUrl);
                          setVehicleInfo(updated);
                          setSelectedVehicle((prev) => ({
                            ...prev,
                            imageUrl: newImageUrl,
                          }));
                        }
                      );
                    }}
                    style={{
                      flex: 1,
                      backgroundColor: "#ef4444", // red
                      paddingVertical: 10,
                      borderRadius: 6,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "white", fontWeight: "bold" }}>
                      Изтрий
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Vehicle Info Card */}
            <VehicleCard style={{ borderStyle: "solid", borderWidth: 0.1 }}>
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

            {/* delete vehicle */}
            <TouchableOpacity
              onPress={async () => {
                const result = await removeVehicleFromUser(
                  route?.params?.email,
                  selectedVehicle.plate
                );

                if (result.success) {
                  Alert.alert("Успешно", result.message);

                  // Re-fetch vehicles
                  await fetchVehicleInfo(
                    route.params.email,
                    setVehicleInfo,
                    setMessage,
                    setMessageType,
                    handleMessage
                  );

                  setSelectedVehicle("");
                } else {
                  Alert.alert("Грешка", result.message);
                }
              }}
              style={{
                flex: 1,
                backgroundColor: "#ef4444", // red
                paddingVertical: 10,
                borderRadius: 6,
                marginTop: 10,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>
                Премахни превозно средство
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <VehicleCard style={{ borderStyle: "solid", borderWidth: 0.1 }}>
            <VehicleRow>
              <VehicleLabel>Не е избрано превозно средство.</VehicleLabel>
            </VehicleRow>
          </VehicleCard>
        )}
      </VehicleContainer>
    </ScrollView>
  );
};

const inputStyle = {
  backgroundColor: "white",
  borderColor: "#ccc",
  borderWidth: 1,
  padding: 10,
  marginBottom: 12,
  borderRadius: 6,
};

export default AboutVehicle;
