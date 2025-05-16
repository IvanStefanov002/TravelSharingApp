import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import axios from "axios";
import React, { useCallback, useState } from "react";

import { baseAPIUrl } from "@/components/shared";
import { fetchUserDataById } from "@/utils/fetchUserDataById";
import DateTimePicker from "@react-native-community/datetimepicker";

import { createTrip } from "@/utils/createTrip";
import { pickImageTrip } from "@/utils/imageHandlers";

import {
  ActivityIndicator,
  Button,
  Dimensions,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  const initialTab = route.params?.activeTab || "explore"; // default if not passed

  //StatusBar.setHidden(false);
  const [currentPage, setCurrentPage] = useState(1);
  const tripsPerPage = 3;

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
    date: new Date(),
    price_per_seat: "",
    available_seats: "",
    car: {
      make: "",
      model: "",
      year: "",
      color: "",
      plate: "",
      mileage: "",
      fuelType: "",
      transmissionType: "",
      //imageUrl: "",
    },
  });

  const [message, setMessage] = useState("DEFAULT");
  const [messageType, setMessageType] = useState("FAILED");

  const [showDatePicker, setShowDatePicker] = useState(false);

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
      return prev; // fallback
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

  const handleSubmitTrip = async () => {
    tripData.driver_id = route?.params?.id;
    const success = await createTrip(tripData, setMessage, setMessageType);
    if (success) {
      setTripData({
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
        date: new Date(),
        price_per_seat: "",
        available_seats: "",
        car: {
          make: "",
          model: "",
          year: "",
          color: "",
          plate: "",
          mileage: "",
          fuelType: "",
          transmissionType: "",
        },
      });

      // Optionally navigate or reset form
      navigation.navigate("Home"); // Or another screen
    }
  };

  useFocusEffect(
    useCallback(() => {
      const fetchTripsWithDrivers = async () => {
        try {
          setIsLoading(true);

          // 1. Fetch all trips
          const tripResponse = await axios.get(`${baseAPIUrl}/trips/fetchData`);

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
              trip.vehicle_image = trip.vehicle_image.replace(
                "http://localhost:3000",
                baseAPIUrl
              );
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

      // Set tab if passed
      if (route.params?.activeTab) {
        setActiveTab(route.params.activeTab);
      }

      // reset filters
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

  return (
    //<KeyboardAvoidingWrapper>
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
          onPress={() => setActiveTab("create")}
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
                  <CardImage source={{ uri: trip.vehicle_image }} />
                  <LocationContainer>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={14}
                      color="#6d28d9"
                    />
                    <LocationText
                      style={{
                        color:
                          trip.article_status == "available" ? "green" : "red",
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
                    <LocationText>{trip.departure_datetime}</LocationText>
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
            <Button
              title="Add Image"
              onPress={() =>
                pickImageTrip(
                  setTripData,
                  setImageName,
                  setMessage,
                  setMessageType
                )
              }
            />
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

            <CarInputColumn>
              <Label>Mileage (km)</Label>
              <StyledInput
                placeholder="120000"
                keyboardType="numeric"
                value={tripData.car.mileage}
                onChangeText={(text) => onChangeCar("mileage", text)}
              />
            </CarInputColumn>

            <CarInputColumn>
              <Label>Fuel Type</Label>
              <StyledInput
                placeholder="Petrol / Diesel / Electric"
                value={tripData.car.fuelType}
                onChangeText={(text) => onChangeCar("fuelType", text)}
              />
            </CarInputColumn>

            <CarInputColumn>
              <Label>Transmission Type</Label>
              <StyledInput
                placeholder="Manual / Automatic"
                value={tripData.car.transmissionType}
                onChangeText={(text) => onChangeCar("transmissionType", text)}
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
              placeholder="Sofia"
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
              placeholder="Varna"
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
              }}
            >
              <Text style={{ color: "#111827" }}>
                {tripData.date.toLocaleString()}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                testID="dateTimePicker"
                value={tripData.date}
                mode="date"
                is24Hour={true}
                display="default"
                onChange={(event, selectedDate) => {
                  const currentDate = selectedDate || tripData.date;
                  setShowDatePicker(false);
                  onChange("date", currentDate);
                }}
              />
            )}
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
    //</KeyboardAvoidingWrapper>
  );
}
