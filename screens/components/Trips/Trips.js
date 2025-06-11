import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";

import { baseAPIUrl } from "@/components/shared";
import { fetchUserDataById } from "@/utils/fetchUserDataById";
import DateTimePicker from "@react-native-community/datetimepicker";

import { createTrip } from "@/utils/createTrip";
import { fetchVehicleInfo } from "@/utils/fetchVehicleInfo";
import { pickImageTrip } from "@/utils/imageHandlers";

/* JWT token storage */
import AsyncStorage from "@react-native-async-storage/async-storage";

/* google maps */
import MapView, { Marker } from "react-native-maps";
import { fetchGoogleApiKey } from "./../../../utils/fetchGoogleApiKey";

import ResponsiveImage from "./../../../components/ResponsiveImage";

import {
  ActivityIndicator,
  Alert,
  Button,
  Dimensions,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { handleMessage } from "@/utils/messages";
import {
  CarInputColumn,
  CarInputContainer,
  CreateScreenTripContainer,
  Filter,
  FilterInput,
  FilterLabel,
  FiltersContainer,
  InputGroup,
  Label,
  LabelRow,
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
  SectionNote,
  StyledInput,
  StyledScrollView,
  SuggestButton,
  SuggestButtonText,
  TripCard,
  TripDriverNote,
  TripsContainer,
  TripsCTAButton,
} from "./../../../components/styles";

const screenWidth = Dimensions.get("window").width;

export default function Trips({ navigation }) {
  /* activeTab param is passed by Home screen's buttons */
  const route = useRoute();
  const initialTab =
    route.params?.activeTab || "explore"; /* default if not passed */
  const userEmail = route.params?.email || "guest@tu-sofia.bg";

  /* google maps integration */
  const [googleApiKey, setGoogleApiKey] = useState("");
  const [selectingLocation, setSelectingLocation] = useState(null);
  const [startLocationCoords, setStartLocationCoords] = useState(null);
  const [endLocationCoords, setEndLocationCoords] = useState(null);
  const [tripDistanceAndTime, setTripDistanceAndTime] = useState(null);

  /* for trip creation */
  const [imageName, setImageName] = useState("");
  const [selectedCar, setSelectedCar] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);

  /* for choosing predefined vehicle */
  const [modalVisible, setModalVisible] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const [aspectRatio, setAspectRatio] = useState(null);

  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showFilters, setShowFilters] = useState(true);

  const [message, setMessage] = useState("DEFAULT");
  const [messageType, setMessageType] = useState("FAILED");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  /* suggest price per seat calculation */
  const [showSuggestModal, setShowSuggestModal] = useState(false);
  const [fuelConsumption, setFuelConsumption] = useState("");
  const [fuelPrice, setFuelPrice] = useState("");

  const isDriver = route?.params?.roles?.includes("driver");

  const cardOptions = ["Bank", "Revolut"];
  const cashOptions = ["BGN", "EUR"];
  const tripsPerPage = 3;

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
      // latitude: null,
      // longitude: null,
    },
    end_location: {
      city: "",
      address: "",
      // latitude: null,
      // longitude: null,
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

  useFocusEffect(
    useCallback(() => {
      const fetchTripsWithDrivers = async () => {
        try {
          setIsLoading(true);

          /* Get JWT token from AsyncStorage */
          const token = await AsyncStorage.getItem("token");

          /* Include the token in the headers of the request */
          const tripResponse = await axios.get(
            `${baseAPIUrl}/trips/fetchData`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          /* Process trips */
          tripResponse.data = tripResponse.data.map((trip) => {
            if (trip.departure_datetime) {
              trip.departure_datetime = trip.departure_datetime
                .replace("T", " ")
                .replace("Z", "");
            }
            if (trip.vehicle_image) {
              trip.vehicle_image = trip.vehicle_image;
            }
            return trip;
          });

          const tripsData = tripResponse.data;

          const driverFetches = tripsData.map((trip) =>
            fetchUserDataById(trip.driver_id)
          );
          const driverDataList = await Promise.all(driverFetches);

          const enrichedTrips = tripsData.map((trip, index) => ({
            ...trip,
            driver: driverDataList[index],
          }));

          setTrips(enrichedTrips);
        } catch (error) {
          console.error("Error fetching trips or drivers:", error.message);
        } finally {
          setIsLoading(false);
        }
      };

      if (route.params?.activeTab) {
        setActiveTab(route.params.activeTab);
      }

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

  /* UseEffect to fetch Google API key */
  useEffect(() => {
    const getKey = async () => {
      const key = await fetchGoogleApiKey();
      if (key) setGoogleApiKey(key);
    };

    getKey();
  }, []);

  useEffect(() => {
    const { start_location, end_location } = tripData;
    if (start_location?.latitude && end_location?.latitude) {
      // update distance/time or anything else
      getDrivingDistanceAndTime(
        start_location,
        end_location,
        googleApiKey
      ).then(setTripDistanceAndTime);
    }
  }, [tripData.start_location, tripData.end_location]);

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
    /* reset fields for distance and time calculations */
    setStartLocationCoords("");
    setEndLocationCoords("");

    setTripDistanceAndTime("");

    /* fuel consuption for suggesting price */
    setFuelConsumption("");
    setFuelPrice("");

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
        // latitude: null,
        // longitude: null,
      },
      end_location: {
        city: "",
        address: "",
        // latitude: null,
        // longitude: null,
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

  const getDrivingDistanceAndTime = async (startCoords, endCoords, apiKey) => {
    const origin = `${startCoords.latitude},${startCoords.longitude}`;
    const destination = `${endCoords.latitude},${endCoords.longitude}`;

    /* url to fetch desired info from google's Distance Matrix API */
    /* &departure_time=now = let's calculation of traffic */

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${apiKey}&mode=driving&departure_time=now`;

    /* The Google Maps Distance Matrix API does not allow you to specify a driving speed as a parameter directly. It uses real-world data such as:
      Road types and speed limits
      Traffic conditions (if enabled)
      Typical vs live traffic (depending on the departure_time parameter)
    */

    try {
      const response = await axios.get(url);
      const data = response.data;

      if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
        const element = data.rows[0].elements[0];

        return {
          distanceText: element.distance.text,
          durationText: element.duration_in_traffic
            ? element.duration_in_traffic.text // e.g., "35 mins with traffic"
            : element.duration.text, // fallback if no traffic data
        };
      } else {
        throw new Error("No valid route found");
      }
    } catch (error) {
      console.error("Error fetching distance:", error.message);
      return null;
    }
  };

  function parseAddressComponents(components) {
    let city = "";
    let neighborhood = "";
    let street = "";
    let streetNumber = "";

    components.forEach((component) => {
      const types = component.types;
      if (types.includes("locality")) {
        city = component.long_name;
      } else if (
        types.includes("sublocality_level_1") ||
        types.includes("neighborhood")
      ) {
        neighborhood = component.long_name;
      } else if (types.includes("route")) {
        street = component.long_name;
      } else if (types.includes("street_number")) {
        streetNumber = component.long_name;
      }
    });

    const addressParts = [];
    if (neighborhood) addressParts.push(neighborhood);
    if (street) addressParts.push(street);
    if (streetNumber) addressParts.push(streetNumber);

    const address = addressParts.join(", ");

    return { city, address };
  }

  const fetchAddressFromCoords = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}`
      );
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const components = data.results[0].address_components;
        return parseAddressComponents(components);
      }
      return { city: "", address: "" };
    } catch (error) {
      console.error("Geocoding error:", error);
      return { city: "", address: "" };
    }
  };

  const handleMapPress = async (event) => {
    const coords = event.nativeEvent.coordinate;
    const { city, address } = await fetchAddressFromCoords(
      coords.latitude,
      coords.longitude
    );

    let updatedStartCoords = startLocationCoords;
    let updatedEndCoords = endLocationCoords;

    if (selectingLocation === "start") {
      setStartLocationCoords(coords);
      setTripData((prev) => ({
        ...prev,
        start_location: {
          ...prev.start_location,
          latitude: coords.latitude,
          longitude: coords.longitude,
          city: city || prev.start_location.city,
          address: address || prev.start_location.address,
        },
      }));
    } else if (selectingLocation === "end") {
      setEndLocationCoords(coords);
      setTripData((prev) => ({
        ...prev,
        end_location: {
          ...prev.end_location,
          latitude: coords.latitude,
          longitude: coords.longitude,
          city: city || prev.end_location.city,
          address: address || prev.end_location.address,
        },
      }));
    }

    if (startLocationCoords && endLocationCoords) {
      const result = await getDrivingDistanceAndTime(
        updatedStartCoords,
        updatedEndCoords,
        googleApiKey
      );

      setTripDistanceAndTime(result);
    }

    setSelectingLocation(null);
  };

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

  const handleSuggestPriceCalculation = () => {
    const distanceKm = parseFloat(
      tripDistanceAndTime?.distanceText?.replace("km", "").trim()
    ); // e.g., 120
    const consumption = parseFloat(fuelConsumption); // e.g., 7.5
    const fuelPriceNumber = parseFloat(fuelPrice);

    if (!distanceKm || !consumption || !fuelPriceNumber) return;

    const totalLiters = (consumption / 100) * distanceKm;
    const totalFuelCost = totalLiters * fuelPriceNumber;

    const suggestedPricePerSeat = (
      totalFuelCost / (tripData.available_seats || 1)
    ).toFixed(2);

    onChange("price_per_seat", suggestedPricePerSeat);

    setShowSuggestModal(false);
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
          alignItems: "center",
          marginTop: 10,
          marginBottom: 10,
        }}
      >
        {/* Explore Trips Button */}
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

        {/* Create Trip Button */}
        <TouchableOpacity
          onPress={() => {
            if (isDriver) {
              setActiveTab("create");
              resetTripFields();
            }
          }}
          disabled={!isDriver}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 20,
            backgroundColor: activeTab === "create" ? "#6d28d9" : "#e5e7eb",
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
            opacity: isDriver ? 1 : 0.5,
          }}
        >
          <Text style={{ color: activeTab === "create" ? "white" : "#111827" }}>
            Create Trip
          </Text>
        </TouchableOpacity>

        {/* Info icon */}
        <TouchableOpacity
          onPress={() =>
            Alert.alert(
              "Информация за разделите",
              "• 'Explore Trips' е разрешено за всички потребители на приложението.\n• 'Create Trip' е разрешено само за потребители, които имат роля 'шофьор'."
            )
          }
          style={{ marginLeft: 10 }}
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="#6d28d9"
          />
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
                  <ResponsiveImage
                    imageUrl={`${baseAPIUrl}${trip.vehicle_image}`}
                    style={{ borderRadius: 8, marginBottom: 10 }}
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

          <Text style={{ fontWeight: 400, color: "green" }}>
            Pick <Text style={{ color: "red", fontWeight: 600 }}>start</Text>{" "}
            and <Text style={{ color: "red", fontWeight: 600 }}>end</Text>{" "}
            location from Map:
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 1,
              marginBottom: 10,
            }}
          >
            <TripsCTAButton
              onPress={() => setSelectingLocation("start")}
              style={{ flex: 1, marginRight: 5, backgroundColor: "#6d28d9" }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Select Start Location
              </Text>
            </TripsCTAButton>
            <TripsCTAButton
              onPress={() => setSelectingLocation("end")}
              style={{ flex: 1, marginLeft: 5, backgroundColor: "#6d28d9" }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Select End Location
              </Text>
            </TripsCTAButton>
          </View>

          {(selectingLocation === "start" || selectingLocation === "end") && (
            <View style={{ height: 300, marginBottom: 60 }}>
              <MapView
                style={{ width: "100%", height: 300 }}
                onPress={handleMapPress}
                initialRegion={{
                  latitude:
                    (selectingLocation === "end"
                      ? endLocationCoords.latitude
                      : startLocationCoords.latitude) ||
                    42.6977 /* default coordinates - София */,
                  longitude:
                    (selectingLocation === "end"
                      ? endLocationCoords.longitude
                      : startLocationCoords.longitude) ||
                    23.3219 /* default coordinates - София */,
                  latitudeDelta: 0.02,
                  longitudeDelta: 0.05,
                }}
              >
                <Marker
                  coordinate={{
                    latitude:
                      (selectingLocation === "end"
                        ? endLocationCoords.latitude
                        : startLocationCoords.latitude) ||
                      42.6977 /* default coordinates - София */,
                    longitude:
                      (selectingLocation === "end"
                        ? endLocationCoords.longitude
                        : startLocationCoords.longitude) ||
                      23.3219 /* default coordinates - София */,
                  }}
                />
              </MapView>

              <TripsCTAButton
                onPress={() => setSelectingLocation(null)}
                style={{ marginTop: 10, backgroundColor: "#facc15" }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  Hide Map
                </Text>
              </TripsCTAButton>
            </View>
          )}

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
            <Label>
              <Ionicons name="paw-outline" size={20} color="#6d28d9" /> Pets
              allowed
            </Label>
            <RadioContainer>
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
            </RadioContainer>
          </InputGroup>

          <InputGroup>
            <Label>
              <Ionicons name="logo-no-smoking" size={20} color="#6d28d9" />{" "}
              Smoking allowed
            </Label>
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
            <Label>Available Seats</Label>
            <StyledInput
              placeholder="3"
              keyboardType="numeric"
              value={tripData.available_seats}
              onChangeText={(text) => onChange("available_seats", text)}
            />
          </InputGroup>

          <InputGroup>
            <LabelRow>
              <Label>Price per Seat (BGN)</Label>
              <SuggestButton
                onPress={() => setShowSuggestModal(true)}
                disabled={!tripData.available_seats || !tripDistanceAndTime}
                style={{
                  opacity:
                    tripData.available_seats && tripDistanceAndTime.distanceText
                      ? 1
                      : 0.5 /* makes it look disabled */,
                }}
              >
                <SuggestButtonText>Suggest Price</SuggestButtonText>
              </SuggestButton>
            </LabelRow>

            <StyledInput
              placeholder="10"
              keyboardType="numeric"
              value={tripData.price_per_seat}
              onChangeText={(text) => onChange("price_per_seat", text)}
            />
          </InputGroup>

          {renderOptions(
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="card-outline" size={16} color="#6d28d9" />
              <Text style={{ marginLeft: 6 }}>Card Options</Text>
            </View>,
            cardOptions,
            "card"
          )}

          {renderOptions(
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="cash-outline" size={16} color="#6d28d9" />
              <Text style={{ marginLeft: 6 }}>Cash Options</Text>
            </View>,
            cashOptions,
            "cash"
          )}

          <Line></Line>
          <SectionNote style={{ marginBottom: 0 }}>
            Note: Only available if you choosed location from Maps
          </SectionNote>
          <View
            style={{
              backgroundColor: "#f3f4f6",
              padding: 16,
              borderRadius: 12,
              marginVertical: 16,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Estimated distance and duration based on Google Maps:
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 4,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: "#6b7280" }}>Distance</Text>
                <Text
                  style={{ fontSize: 16, fontWeight: "500", color: "#111827" }}
                >
                  {tripDistanceAndTime?.distanceText || "--"}
                </Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, color: "#6b7280" }}>
                  Estimated Duration
                </Text>
                <Text
                  style={{ fontSize: 16, fontWeight: "500", color: "#111827" }}
                >
                  {tripDistanceAndTime?.durationText || "--"}
                </Text>
              </View>
            </View>
          </View>

          <TripsCTAButton
            style={{ marginBottom: 90 }}
            onPress={handleSubmitTrip}
          >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
              Submit Trip
            </Text>
          </TripsCTAButton>

          <Modal
            visible={showSuggestModal}
            transparent
            animationType="slide"
            onRequestClose={() => setShowSuggestModal(false)}
          >
            <View style={modalOverlay}>
              <View style={modalContainer}>
                <Text style={modalTitle}>Fuel Consumption</Text>
                <TextInput
                  placeholder=" l/100km "
                  keyboardType="numeric"
                  value={fuelConsumption}
                  onChangeText={setFuelConsumption}
                  style={modalInput}
                />
                <TextInput
                  placeholder="Fuel price (BGN/L)"
                  keyboardType="numeric"
                  value={fuelPrice}
                  onChangeText={(text) => setFuelPrice(text)}
                  style={modalInput}
                />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <TouchableOpacity onPress={() => setShowSuggestModal(false)}>
                    <Text style={modalCancel}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleSuggestPriceCalculation}>
                    <Text style={modalConfirm}>Calculate</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </CreateScreenTripContainer>
      )}
    </StyledScrollView>
  );
}

const styles = StyleSheet.create({
  selected: {
    backgroundColor: "#b2f2bb",
  },
  optionSelected: {
    backgroundColor: "#b2f2bb",
    borderColor: "#6d28d9",
  },
});

const modalOverlay = {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.5)",
};

const modalContainer = {
  backgroundColor: "#fff",
  padding: 20,
  borderRadius: 10,
  width: "80%",
};

const modalTitle = {
  fontSize: 16,
  marginBottom: 12,
  fontWeight: "bold",
};

const modalInput = {
  borderWidth: 1,
  borderColor: "#ccc",
  padding: 10,
  borderRadius: 6,
  marginBottom: 20,
};

const modalCancel = {
  color: "#999",
  fontSize: 16,
};

const modalConfirm = {
  color: "#2563eb",
  fontWeight: "bold",
  fontSize: 16,
};
