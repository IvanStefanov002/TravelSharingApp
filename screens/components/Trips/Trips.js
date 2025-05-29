import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import axios from "axios";
import React, { useCallback, useState } from "react";

import { baseAPIUrl } from "@/components/shared";
import { fetchUserDataById } from "@/utils/fetchUserDataById";
import DateTimePicker from "@react-native-community/datetimepicker";

import { createTrip } from "@/utils/createTrip";
import { fetchVehicleInfo } from "@/utils/fetchVehicleInfo";
import { pickImageTrip } from "@/utils/imageHandlers";

import {
  ActivityIndicator,
  Button,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { handleMessage } from "@/utils/messages";
import {
  CardImage,
  CarInputColumn,
  CarInputContainer,
  CreateScreenTripContainer,
  Filter,
  FilterInput,
  FilterLabel,
  FiltersContainer,
  InputGroup,
  Label,
  Line,
  LocationContainer,
  LocationText,
  NoTripsText,
  OptionButton,
  OptionsContainer,
  OptionText,
  RadioButton,
  RadioCircle,
  RadioContainer,
  RadioText,
  RedText,
  StyledInput,
  StyledScrollView,
  TripCard,
  TripDriverNote,
  TripsContainer,
  TripsCTAButton,
} from "./../../../components/styles";

const screenWidth = Dimensions.get("window").width;

export default function Trips({ navigation }) {
  /* for trip creation */
  const [imageName, setImageName] = useState("");
  /* to here */

  /* activeTab param is passed by Home screen's buttons */
  const route = useRoute();
  const initialTab =
    route.params?.activeTab || "explore"; /* default if not passed */
  const userEmail = route.params?.email || "guest@tu-sofia.bg";

  const [currentPage, setCurrentPage] = useState(1);
  const tripsPerPage = 3;

  /* for choosing predefined vehicle */
  const [modalVisible, setModalVisible] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showFilters, setShowFilters] = useState(true);
  const [filter, setFilter] = useState({
    origin: "",
    destination: "",
    maxPrice: "",
    petsAllowed: "Any",
    smokingAllowed: "Any",
    availableSeats: "Any",
    articleStatus: "Any",
  });

  const [tripData, setTripData] = useState({
    created_on: new Date(),
    driver_id: "",
    vehicle_image: "",
    title: "",
    trip_description: "",
    start_location: {
      city: "",
      address: "",
    },
    end_location: {
      city: "",
      address: "",
    },
    departure_datetime: new Date(),
    is_pets_allowed: "",
    is_allowed_smoking: "",
    price_per_seat: "",
    available_seats: "",
    checkout_options: [],
    taken_seats: [],
    car: {
      make: "",
      model: "",
      year: "",
      color: "",
      plate: "",
    },
  });

  const cardOptions = ["Bank", "Revolut"];
  const cashOptions = ["BGN", "EUR"];

  const [message, setMessage] = useState("DEFAULT");
  const [messageType, setMessageType] = useState("FAILED");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const onChange = (path, value) => {
    const keys = path.split(".");

    setTripData((prev) => {
      if (keys.length === 1) {
        return { ...prev, [keys[0]]: value };
      } else if (keys.length === 2) {
        return {
          ...prev,
          [keys[0]]: {
            ...prev[keys[0]],
            [keys[1]]: value,
          },
        };
      }
      return prev;
    });
  };

  const onChangeCar = (key, value) => {
    setTripData((prev) => ({
      ...prev,
      car: {
        ...prev.car,
        [key]: value,
      },
    }));
  };

  const resetTripFields = () => {
    /* clear image */
    setImageName("");

    /* clear fields */
    setTripData({
      created_on: new Date(),
      driver_id: "",
      vehicle_image: "",
      title: "",
      trip_description: "",
      start_location: {
        city: "",
        address: "",
      },
      end_location: {
        city: "",
        address: "",
      },
      departure_datetime: new Date(),
      is_pets_allowed: "",
      is_allowed_smoking: "",
      price_per_seat: "",
      available_seats: "",
      checkout_options: [],
      taken_seats: [],
      car: {
        make: "",
        model: "",
        year: "",
        color: "",
        plate: "",
      },
    });
  };

  const handleSubmitTrip = async () => {
    /* set created on field */
    tripData.created_on = new Date().toLocaleString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    /* set driver_id */
    tripData.driver_id = route?.params?.id;

    console.log(`about to insert this trip:`, tripData);

    /* send request to upload trip */
    const success = await createTrip(tripData, setMessage, setMessageType);

    if (success) {
      resetTripFields();
      navigation.navigate("Home");
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchTripsWithDrivers = async () => {
        try {
          setIsLoading(true);

          // 1. Fetch all trips
          const tripResponse = await axios.get(`${baseAPIUrl}/trips/fetchData`);

          /*
           tezi zaqvki trqbva da mogat da se pravqt samo ot user-ri. Kato vlezne(login) user da se suzdade JWT
           token koito da se izpolzva ot nego za dostup to rest api-to. da izpolzvam JWT v express.
          */

          /* for each trip params */
          tripResponse.data = tripResponse.data.map((trip) => {
            /* replace datetime */
            if (trip.departure_datetime) {
              trip.departure_datetime = trip.departure_datetime
                .replace("T", " ")
                .replace("Z", "");
            }

            /* replace image url */
            if (trip.vehicle_image) {
              trip.vehicle_image = trip.vehicle_image;
            }

            return trip;
          });

          const tripsData = tripResponse.data;

          // 2. Fetch each driver by trip.driver_id
          const driverFetches = tripsData.map((trip) =>
            fetchUserDataById(trip.driver_id)
          );
          const driverDataList = await Promise.all(driverFetches);

          // 3. Combine each trip with its driver
          const enrichedTrips = tripsData.map((trip, index) => ({
            ...trip,
            driver: driverDataList[index],
          }));

          setTrips(enrichedTrips); // Now each trip has trip.driver
        } catch (error) {
          console.error("Error fetching trips or drivers:", error.message);
        } finally {
          setIsLoading(false);
        }
      };

      /* Set tab if passed */
      if (route.params?.activeTab) {
        setActiveTab(route.params.activeTab);
      }

      /* reset filters */
      setFilter({
        origin: "",
        destination: "",
        maxPrice: "",
        petsAllowed: "Any",
        smokingAllowed: "Any",
        availableSeats: "Any",
        articleStatus: "Any",
      });

      fetchTripsWithDrivers();
    }, [route.params?.activeTab])
  );

  const [selectedCar, setSelectedCar] = useState(null);

  const handleFetchUserVehicle = async () => {
    if (!userEmail) {
      handleMessage("User email is missing", "FAILED");
      return;
    }

    setLoading(true);
    5;
    await fetchVehicleInfo(
      userEmail,
      setVehicleInfo,
      setMessage,
      setMessageType,
      handleMessage
    );

    setLoading(false);
  };

  const handleOpenModal = async () => {
    setModalVisible(true);
    await handleFetchUserVehicle(); /* fetches vehicle data when modal opens */
  };

  const handlePickerChange = (value, fieldName) => {
    if (value !== undefined) {
      setFilter({ ...filter, [fieldName]: value });
    }
  };

  const filteredTrips = trips.filter((trip) => {
    const matchesOrigin =
      filter.origin === "" ||
      trip.start_location?.city
        ?.toLowerCase()
        .includes(filter.origin.toLowerCase());
    const matchesDestination =
      filter.destination === "" ||
      trip.end_location?.city
        ?.toLowerCase()
        .includes(filter.destination.toLowerCase());
    const matchesPrice =
      filter.maxPrice === "" ||
      trip.price_per_seat <= parseInt(filter.maxPrice);
    const matchesPets =
      filter.petsAllowed === "Any" ||
      trip.is_pets_allowed.toLowerCase() === filter.petsAllowed.toLowerCase();
    const matchesSmoking =
      filter.smokingAllowed === "Any" ||
      trip.is_allowed_smoking.toLowerCase() ===
        filter.smokingAllowed.toLowerCase();
    const matchesSeats =
      filter.availableSeats === "Any" ||
      trip.available_seats.toString() === filter.availableSeats;
    const matchesStatus =
      filter.articleStatus === "Any" ||
      trip.article_status === filter.articleStatus;

    return (
      matchesOrigin &&
      matchesDestination &&
      matchesPrice &&
      matchesPets &&
      matchesSmoking &&
      matchesSeats &&
      matchesStatus
    );
  });

  /* for showing first 10 pages logic */
  const isFilterApplied = Object.values(filter).some(
    (val) => val !== "" && val !== "Any"
  );

  const displayedTrips = isFilterApplied
    ? filteredTrips
    : filteredTrips.slice(0, 5);

  const paginatedTrips = isFilterApplied
    ? filteredTrips.slice(0, currentPage * tripsPerPage)
    : filteredTrips.slice(0, 5);

  const renderOptions = (label, options, path) => (
    <InputGroup>
      <Label>{label}</Label>
      <OptionsContainer>
        {options.map((option) => {
          const selected = tripData.checkout_options?.[path]?.includes(option);
          return (
            <OptionButton
              key={option}
              style={[selected && styles.optionSelected]}
              onPress={() => {
                const currentValues = tripData.checkout_options?.[path] || [];
                const updatedValues = selected
                  ? currentValues.filter((val) => val !== option)
                  : [...currentValues, option];
                onChange(`checkout_options.${path}`, updatedValues);
              }}
            >
              <OptionText>{option}</OptionText>
            </OptionButton>
          );
        })}
      </OptionsContainer>
    </InputGroup>
  );

  return (
    <StyledScrollView>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          marginTop: 40,
          marginBottom: 10,
        }}
      >
        <TouchableOpacity
          onPress={() => setActiveTab("explore")}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 20,
            backgroundColor: activeTab === "explore" ? "#6d28d9" : "#e5e7eb",
            borderTopLeftRadius: 10,
            borderBottomLeftRadius: 10,
          }}
        >
          <Text
            style={{ color: activeTab === "explore" ? "white" : "#111827" }}
          >
            Explore Trips
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setActiveTab("create");
            resetTripFields();
          }}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 20,
            backgroundColor: activeTab === "create" ? "#6d28d9" : "#e5e7eb",
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
          }}
        >
          <Text style={{ color: activeTab === "create" ? "white" : "#111827" }}>
            Create Trip
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "explore" ? (
        <>
          <TouchableOpacity
            style={{
              padding: 10,
              alignSelf: "flex-end",
              marginRight: 15,
              marginTop: 5,
            }}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={{ color: "#6d28d9", fontWeight: "bold" }}>
              {showFilters ? "Hide Filters ▲" : "Show Filters ▼"}
            </Text>
          </TouchableOpacity>

          {showFilters && (
            <FiltersContainer>
              <Filter>
                <FilterLabel>Origin</FilterLabel>
                <FilterInput
                  placeholder="Enter city"
                  value={filter.origin}
                  onChangeText={(text) =>
                    setFilter({ ...filter, origin: text })
                  }
                />
              </Filter>

              <Filter>
                <FilterLabel>Destination</FilterLabel>
                <FilterInput
                  placeholder="Enter city"
                  value={filter.destination}
                  onChangeText={(text) =>
                    setFilter({ ...filter, destination: text })
                  }
                />
              </Filter>

              <Filter>
                <FilterLabel>Max Price</FilterLabel>
                <FilterInput
                  placeholder="Enter max price"
                  keyboardType="numeric"
                  value={filter.maxPrice}
                  onChangeText={(text) =>
                    setFilter({ ...filter, maxPrice: text })
                  }
                />
              </Filter>

              <Filter>
                <FilterLabel>Pets Allowed</FilterLabel>
                <Picker
                  selectedValue={filter.petsAllowed}
                  onValueChange={(value) =>
                    handlePickerChange(value, "petsAllowed")
                  }
                >
                  <Picker.Item label="Any" value="Any" />
                  <Picker.Item label="Yes" value="yes" />
                  <Picker.Item label="No" value="no" />
                </Picker>
              </Filter>

              <Filter>
                <FilterLabel>Smoking Allowed</FilterLabel>
                <Picker
                  selectedValue={filter.smokingAllowed}
                  onValueChange={(value) =>
                    handlePickerChange(value, "smokingAllowed")
                  }
                >
                  <Picker.Item label="Any" value="Any" />
                  <Picker.Item label="Yes" value="yes" />
                  <Picker.Item label="No" value="no" />
                </Picker>
              </Filter>

              <Filter>
                <FilterLabel>Available Seats</FilterLabel>
                <Picker
                  selectedValue={filter.availableSeats}
                  onValueChange={(value) =>
                    handlePickerChange(value, "availableSeats")
                  }
                >
                  <Picker.Item label="Any" value="Any" />
                  <Picker.Item label="0" value="0" />
                  <Picker.Item label="1" value="1" />
                  <Picker.Item label="2+" value="2" />
                </Picker>
              </Filter>

              <Filter>
                <FilterLabel>Status</FilterLabel>
                <Picker
                  selectedValue={filter.articleStatus}
                  onValueChange={(value) =>
                    handlePickerChange(value, "articleStatus")
                  }
                >
                  <Picker.Item label="Any" value="Any" />
                  <Picker.Item label="Available" value="available" />
                  <Picker.Item label="Finished" value="finished" />
                </Picker>
              </Filter>
            </FiltersContainer>
          )}

          <Line></Line>
          {!isFilterApplied && (
            <TripDriverNote>
              Note: Currently are displayed trips without status filter. You can
              apply additional filters from above.
            </TripDriverNote>
          )}

          <TripsContainer
            style={{
              marginBottom:
                isFilterApplied &&
                (currentPage > 1 ||
                  paginatedTrips.length < filteredTrips.length)
                  ? 0
                  : 80,
            }}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color="#6d28d9" />
            ) : filteredTrips.length === 0 ? (
              <NoTripsText>No trips available</NoTripsText>
            ) : (
              paginatedTrips.map((trip) => (
                <TripCard key={trip._id}>
                  <Text
                    style={{
                      position: "absolute",
                      top: 10,
                      right: 10,
                      backgroundColor: "rgba(255, 255, 255, 0.8)",
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 5,
                      fontSize: 12,
                      zIndex: 10,
                    }}
                  >
                    Created on:{" "}
                    {trip.created_on ? trip.created_on : "not available"}
                  </Text>
                  <CardImage
                    style={{ backgroundColor: "lightgray" }}
                    source={{ uri: `${baseAPIUrl}${trip.vehicle_image}` }}
                    resizeMode="contain"
                  />
                  <Text
                    style={{
                      fontWeight: 600,
                      fontSize: 18,
                      fontStyle: "italic",
                      textDecorationLine: "underline",
                      marginBottom: 5,
                    }}
                  >
                    Article overview:
                  </Text>

                  <LocationContainer>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={14}
                      color="#6d28d9"
                    />
                    <LocationText
                      style={{
                        color:
                          trip.article_status === "available"
                            ? "green"
                            : trip.article_status === "on going"
                            ? "#facc15"
                            : "red",
                        fontWeight: 600,
                      }}
                    >
                      {trip.article_status.toUpperCase()}{" "}
                    </LocationText>
                  </LocationContainer>
                  <LocationContainer>
                    <Ionicons
                      name="person-circle-outline"
                      size={14}
                      color="#6d28d9"
                    />
                    <LocationText>{trip.driver.name}</LocationText>
                  </LocationContainer>
                  <LocationContainer>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color="#6d28d9"
                    />
                    <LocationText>
                      {trip.start_location?.city} → {trip.end_location?.city}
                    </LocationText>
                  </LocationContainer>
                  <LocationContainer>
                    <Ionicons name="time-outline" size={14} color="#6d28d9" />
                    <LocationText>
                      {tripData.departure_datetime.toLocaleString([], {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </LocationText>
                  </LocationContainer>
                  <LocationContainer>
                    <Ionicons name="cash-outline" size={16} color="#6d28d9" />
                    <LocationText>
                      <RedText>{`${trip.price_per_seat} BGN`}</RedText>
                      {" per seat"}
                    </LocationText>
                  </LocationContainer>
                  <TripsCTAButton
                    onPress={() =>
                      navigation.navigate("TripDetails", {
                        tripData: trip,
                        loggedUserId: route.params.id,
                      })
                    }
                  >
                    <Text
                      style={{
                        color: "white",
                        fontWeight: 600,
                        fontSize: 16,
                      }}
                    >
                      View Trip
                    </Text>
                  </TripsCTAButton>
                </TripCard>
              ))
            )}
          </TripsContainer>
          {isFilterApplied && (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                marginBottom: currentPage >= 1 ? 100 : 20,
                gap: 20,
              }}
            >
              {currentPage > 1 && (
                <TouchableOpacity onPress={() => setCurrentPage(1)}>
                  <Text style={{ color: "#6d28d9", fontWeight: "bold" }}>
                    Hide Shown Trips ▲
                  </Text>
                </TouchableOpacity>
              )}

              {paginatedTrips.length < filteredTrips.length && (
                <TouchableOpacity
                  onPress={() => setCurrentPage((prev) => prev + 1)}
                >
                  <Text style={{ color: "#6d28d9", fontWeight: "bold" }}>
                    Load More Trips ▼
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </>
      ) : (
        <CreateScreenTripContainer>
          {/* <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
            Create a New Trip
          </Text> */}

          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              marginBottom: 5,
              alignSelf: "center",
            }}
          >
            Describe your vehicle's details:
          </Text>
          <Line style={{ marginBottom: 20, marginTop: 0 }}></Line>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              marginBottom: 10,
            }}
          >
            <Text>Already got vehicle? Pick it up!</Text>
            <TripsCTAButton
              style={{
                marginLeft: 20,
                marginBottom: 10,
                width: 90,
                backgroundColor: "#facc15",
              }}
              onPress={handleOpenModal}
            >
              <Text style={{ color: "black", fontWeight: "bold" }}>Pick</Text>
            </TripsCTAButton>
          </View>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
            >
              <View
                style={{
                  backgroundColor: "#fff",
                  padding: 20,
                  borderRadius: 10,
                  width: "80%",
                  maxHeight: "70%",
                }}
              >
                <Text
                  style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}
                >
                  Select Your Car
                </Text>

                {vehicleInfo?.length > 0 ? (
                  <FlatList
                    data={vehicleInfo}
                    keyExtractor={(item, index) =>
                      item.plate || index.toString()
                    }
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={{
                          padding: 10,
                          borderBottomWidth: 1,
                          borderBottomColor: "#ccc",
                        }}
                        onPress={() => {
                          setSelectedCar(item);
                          setModalVisible(false);

                          /* set params of the fields */
                          tripData.vehicle_image = item.image_url;
                          onChangeCar("make", item.make);
                          onChangeCar("model", item.model);
                          onChangeCar("year", item.year.toString());
                          onChangeCar("color", item.color);
                          onChangeCar("plate", item.plate);
                        }}
                      >
                        <Text style={{ fontWeight: "bold" }}>
                          {`${item.make} ${item.model} (${item.year})`}
                        </Text>
                        <Text>Plate: {item.plate}</Text>
                      </TouchableOpacity>
                    )}
                  />
                ) : (
                  <Text>No cars found for your account.</Text>
                )}

                <View style={{ height: 10 }} />
                <Button
                  title="Cancel"
                  color="red"
                  onPress={() => setModalVisible(false)}
                />
              </View>
            </View>
          </Modal>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-start",
              marginBottom: 10,
            }}
          >
            <TouchableOpacity
              onPress={() =>
                pickImageTrip(
                  setTripData,
                  setImageName,
                  setMessage,
                  setMessageType
                )
              }
              style={{
                backgroundColor: "#facc15",
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 5,
              }}
            >
              <Text style={{ color: "#000", fontWeight: "bold" }}>
                Add Image
              </Text>
            </TouchableOpacity>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                marginLeft: 10,
                flex: 1,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderColor: "#ccc",
                borderRadius: 5,
              }}
            >
              {imageName || "No image selected"}
            </Text>
          </View>
          <CarInputContainer>
            <CarInputColumn>
              <Label>Car Make</Label>
              <StyledInput
                placeholder="Toyota"
                value={tripData.car.make}
                onChangeText={(text) => onChangeCar("make", text)}
              />
            </CarInputColumn>

            <CarInputColumn>
              <Label>Car Model</Label>
              <StyledInput
                placeholder="Corolla"
                value={tripData.car.model}
                onChangeText={(text) => onChangeCar("model", text)}
              />
            </CarInputColumn>

            <CarInputColumn>
              <Label>Car Year</Label>
              <StyledInput
                placeholder="2015"
                keyboardType="numeric"
                value={tripData.car.year}
                onChangeText={(text) => onChangeCar("year", text)}
              />
            </CarInputColumn>

            <CarInputColumn>
              <Label>Car Color</Label>
              <StyledInput
                placeholder="Red"
                value={tripData.car.color}
                onChangeText={(text) => onChangeCar("color", text)}
              />
            </CarInputColumn>

            <CarInputColumn>
              <Label>License Plate</Label>
              <StyledInput
                placeholder="CA1234AB"
                value={tripData.car.plate}
                onChangeText={(text) => onChangeCar("plate", text)}
              />
            </CarInputColumn>
          </CarInputContainer>

          <Text
            style={{
              fontSize: 16,
              fontWeight: "bold",
              marginTop: 10,
              marginBottom: 5,
              alignSelf: "center",
            }}
          >
            Describe your journey's details:
          </Text>
          <Line style={{ marginBottom: 20, marginTop: 0 }}></Line>

          <InputGroup>
            <Label>Trip Title</Label>
            <StyledInput
              placeholder="Weekend to Plovdiv"
              value={tripData.title}
              onChangeText={(text) => onChange("title", text)}
            />
          </InputGroup>

          <InputGroup>
            <Label>Description</Label>
            <StyledInput
              placeholder="Short description..."
              multiline
              numberOfLines={3}
              value={tripData.trip_description}
              onChangeText={(text) => onChange("trip_description", text)}
            />
          </InputGroup>

          <InputGroup>
            <Label>From (City)</Label>
            <StyledInput
              placeholder="Sofia"
              value={tripData.start_location.city}
              onChangeText={(text) => onChange("start_location.city", text)}
            />
          </InputGroup>
          <InputGroup>
            <Label>From (Address)</Label>
            <StyledInput
              placeholder="ul. Hristo Botev 24"
              value={tripData.start_location.address}
              onChangeText={(text) => onChange("start_location.address", text)}
            />
          </InputGroup>

          <InputGroup>
            <Label>To (City)</Label>
            <StyledInput
              placeholder="Varna"
              value={tripData.end_location.city}
              onChangeText={(text) => onChange("end_location.city", text)}
            />
          </InputGroup>
          <InputGroup>
            <Label>To (Address)</Label>
            <StyledInput
              placeholder="ul. Hristo Botev 24"
              value={tripData.end_location.address}
              onChangeText={(text) => onChange("end_location.address", text)}
            />
          </InputGroup>

          <InputGroup>
            <Label>Date & Time</Label>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                borderWidth: 1,
                borderColor: "#d1d5db",
                borderRadius: 10,
                padding: 12,
                marginBottom: 10,
              }}
            >
              <Text style={{ color: "#111827" }}>
                {tripData.departure_datetime.toLocaleString([], {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </Text>
            </TouchableOpacity>

            {/* Date Picker */}
            {showDatePicker && (
              <DateTimePicker
                testID="datePicker"
                value={tripData.departure_datetime}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) {
                    /* merge selected date with existing time */
                    const updatedDate = new Date(tripData.departure_datetime);
                    updatedDate.setFullYear(selectedDate.getFullYear());
                    updatedDate.setMonth(selectedDate.getMonth());
                    updatedDate.setDate(selectedDate.getDate());
                    setTripData({
                      ...tripData,
                      departure_datetime: updatedDate,
                    });
                    setShowTimePicker(true);
                  }
                }}
              />
            )}

            {/* Time Picker */}
            {showTimePicker && (
              <DateTimePicker
                testID="timePicker"
                value={tripData.departure_datetime}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={(event, selectedTime) => {
                  setShowTimePicker(false);
                  if (selectedTime) {
                    const updatedDate = new Date(tripData.departure_datetime);
                    updatedDate.setHours(selectedTime.getHours());
                    updatedDate.setMinutes(selectedTime.getMinutes());
                    setTripData({
                      ...tripData,
                      departure_datetime: updatedDate,
                    });
                  }
                }}
              />
            )}
          </InputGroup>

          <InputGroup>
            <Label>Pets allowed</Label>
            <View style={styles.radioContainer}>
              <RadioButton onPress={() => onChange("is_pets_allowed", "yes")}>
                <RadioCircle
                  style={[
                    tripData.is_pets_allowed === "yes" && styles.selected,
                  ]}
                />
                <RadioText>Yes</RadioText>
              </RadioButton>

              <RadioButton onPress={() => onChange("is_pets_allowed", "no")}>
                <RadioCircle
                  style={[tripData.is_pets_allowed === "no" && styles.selected]}
                />
                <RadioText>No</RadioText>
              </RadioButton>
            </View>
          </InputGroup>

          <InputGroup>
            <Label>Smoking allowed</Label>
            <RadioContainer>
              <RadioButton
                onPress={() => onChange("is_allowed_smoking", "yes")}
              >
                <RadioCircle
                  style={[
                    tripData.is_allowed_smoking === "yes" && styles.selected,
                  ]}
                />
                <RadioText>Yes</RadioText>
              </RadioButton>

              <RadioButton onPress={() => onChange("is_allowed_smoking", "no")}>
                <RadioCircle
                  style={[
                    tripData.is_allowed_smoking === "no" && styles.selected,
                  ]}
                />
                <RadioText>No</RadioText>
              </RadioButton>
            </RadioContainer>
          </InputGroup>

          <InputGroup>
            <Label>Price per Seat (BGN)</Label>
            <StyledInput
              placeholder="10"
              keyboardType="numeric"
              value={tripData.price_per_seat}
              onChangeText={(text) => onChange("price_per_seat", text)}
            />
          </InputGroup>

          <InputGroup>
            <Label>Available Seats</Label>
            <StyledInput
              placeholder="3"
              keyboardType="numeric"
              value={tripData.available_seats}
              onChangeText={(text) => onChange("available_seats", text)}
            />
          </InputGroup>

          {renderOptions("Card Options", cardOptions, "card")}
          {renderOptions("Cash Options", cashOptions, "cash")}

          <TripsCTAButton
            style={{ marginBottom: 90 }}
            onPress={handleSubmitTrip}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              Submit Trip
            </Text>
          </TripsCTAButton>
        </CreateScreenTripContainer>
      )}
    </StyledScrollView>
  );
}

const styles = StyleSheet.create({
  selected: {
    backgroundColor: "#6d28d9",
  },
  optionSelected: {
    backgroundColor: "#6d28d9",
    borderColor: "#6d28d9",
  },
});
