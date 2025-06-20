import { baseAPIUrl } from "@/components/shared";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import React, { useState } from "react";

import { updateTripStatus } from "@/utils/updateTripStatus";
import { updateUserRating } from "@/utils/updateUserRating";

import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

import {
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ContactInfoContainer,
  ContactRowStyle,
  Line,
  LocationContainer,
  LocationIcon,
  LocationText,
  PriceContainer,
  PriceIcon,
  PriceText,
  RedText,
  TripAvailableSeats,
  TripContainer,
  TripDetailsContainer,
  TripDetailsDescription,
  TripLocationAndPriceContainer,
  TripTitle,
} from "./../../../components/styles";

export default function TripDetails({ navigation }) {
  const route = useRoute();
  const { tripData } = route.params;
  const { loggedUserId } = route.params;

  const [trip, setTrip] = useState(tripData || {}); /* safe aproach */
  const [driver, setDriver] = useState(trip?.driver || {}); /* safe aproach */
  const [passengerInfo, setPassengerInfo] = useState({});
  const [showPassengerList, setShowPassengerList] = useState(false);
  const [expandedPassenger, setExpandedPassenger] = useState(null);

  /* manual add a passenger */
  const [manualPassengerNames, setManualPassengerNames] = useState(null);
  const [manualPassengerEmail, setManualPassengerEmail] = useState(null);
  const [manualPassengerPhone, setManualPassengerPhone] = useState(null);

  /* for ratings */
  const [showAddPassengerModal, setShowAddPassengerModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);

  /* for card options */
  const [expandedSection, setExpandedSection] = useState(null);

  /* Fetch trip details once when the component mounts */
  const fetchPassangerInfo = async () => {
    try {
      const info = {};
      for (const id of trip.taken_seats || []) {
        const res = await axios.get(`${baseAPIUrl}/users/${id}`);
        info[id] = res.data;
      }
      setPassengerInfo(info);
    } catch (error) {
      console.error("Error fetching passenger info:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPassangerInfo();
    }, [])
  );

  const toggleSection = (id) => {
    setExpandedSection((prev) => (prev === id ? null : id));
  };

  const handleFinishTrip = async () => {
    const result = await updateTripStatus(trip._id, "finished");

    if (result.success) {
      Alert.alert("Успех", result.message, [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } else {
      Alert.alert("Грешка", result.message);
    }
  };

  const handleOnGoingTrip = async () => {
    const result = await updateTripStatus(trip._id, "on going");

    if (result.success) {
      Alert.alert("Успех", result.message, [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } else {
      Alert.alert("Грепка", result.message);
    }
  };

  const section = {
    id: "payment-methods",
    title: "Методи на плащане",
  };

  const paymentOptions = trip.checkout_options || {};

  const addPassengerToTrip = async (tripId, names, email, phone) => {
    const payload = { tripId, names, email, phone };

    if (trip.available_seats !== 0) {
      try {
        const response = await axios.post(
          `${baseAPIUrl}/trips/bookManual`,
          payload
        );

        if (response.status === 200 || response.status === 201) {
          console.log(
            `User with id ${response.data.userId} booked trip with id ${tripId}`
          );

          setTrip((prevTrip) => ({
            ...prevTrip,
            available_seats: prevTrip.available_seats - 1,
            taken_seats: [...prevTrip.taken_seats, response.data.userId],
          }));

          return {
            success: true,
            message: "Trip passengers updated successfully.",
            data: response.data,
          };
        }
      } catch (error) {
        console.error("Error updating trip:", error.message);

        return {
          success: false,
          message: "Failed to update trip passengers. Please try again later.",
        };
      }
    } else {
      return {
        success: false,
        message: "There are no more available seats!",
      };
    }
  };

  const enrollInATrip = async (userId, tripId) => {
    /* check if booking is possible */
    if (trip.available_seats !== 0) {
      /* there are available seats - book a seat */
      const payload = { tripId, userId };

      try {
        const response = await axios.post(`${baseAPIUrl}/trips/book`, payload);

        if (response.status === 200 || response.status === 201) {
          console.log(`User with id ${userId} booked trip with id ${tripId}`);

          setTrip((prevTrip) => ({
            ...prevTrip,
            available_seats: prevTrip.available_seats - 1,
            taken_seats: [...prevTrip.taken_seats, userId],
          }));

          Alert.alert("Успешно", "Успешно запази това пътуване!", [
            {
              text: "OK",
              onPress: () => navigation.goBack(),
            },
          ]);

          return {
            success: true,
            message: "Trip passengers updated successfully.",
            data: response.data,
          };
        }
      } catch (error) {
        console.error("Error updating trip:", error.message);
        Alert.alert("Грешка", "Не успя да се отпишеш от това пътуване!", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);

        return {
          success: false,
          message: "Failed to update trip passengers. Please try again later.",
        };
      }
    }
  };

  const outrollFromATrip = async (userId, tripId) => {
    /* check if booking is possible */
    //if (trip.available_seats !== 0) {
    /* there are available seats - book a seat */
    const payload = { tripId, userId };

    try {
      const response = await axios.post(`${baseAPIUrl}/trips/unbook`, payload);

      if (response.status === 200 || response.status === 201) {
        console.log(
          `User with id ${userId} canceled booking from trip with id ${tripId}`
        );

        setTrip((prevTrip) => ({
          ...prevTrip,
          available_seats: prevTrip.available_seats + 1,
          taken_seats: prevTrip.taken_seats.filter((id) => id !== userId),
        }));

        Alert.alert("Успех", "Успешно се отказа от това пътуване!", [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error updating trip:", error.message);
      Alert.alert("Fail", "You could not cancel booking of this trip!", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);

      return {
        success: false,
        message: "Failed to update trip passengers. Please try again later.",
      };
    }
    //}
  };

  /* Make sure trip and driver exist before rendering. */
  if (!trip) {
    return <Text>Trip details are not available.</Text>;
  }

  return (
    <ScrollView>
      <TripDetailsContainer>
        <TripTitle>{trip.title}</TripTitle>

        {/* Check if driver exists and has a car image */}
        <View
          style={{
            width: "100%",
            borderRadius: 12,
            backgroundColor: "#ececec",
            padding: 10,
            alignItems: "center",
            position: "relative",
          }}
        >
          {/* Image below the text */}
          {trip && trip.vehicle_image ? (
            <Image
              source={{ uri: `${baseAPIUrl}${trip.vehicle_image}` }}
              style={{
                width: "100%",
                height: 300,
                borderBottomRightRadius: 12,
                borderBottomLeftRadius: 12,
                marginTop: 0,
              }}
              resizeMode="contain"
            />
          ) : (
            <Image
              source={{
                uri: "show empty image",
              }}
              style={{
                width: "100%",
                height: 200,
                borderRadius: 12,
                marginTop: 30,
              }}
            />
          )}
        </View>

        <TripLocationAndPriceContainer>
          {/* Direction - Left aligned */}
          <LocationContainer>
            <LocationIcon name="location-outline" size={20} />
            <LocationText>
              {trip.start_location.city} → {trip.end_location.city}
            </LocationText>
          </LocationContainer>

          {/* Price - Right aligned */}
          <PriceContainer>
            <PriceContainer>
              <PriceIcon name="cash-outline" size={20} />
              <PriceText>
                <RedText>{`${trip.price_per_seat} BGN`}</RedText>
                {" за място"}
              </PriceText>
            </PriceContainer>
          </PriceContainer>
        </TripLocationAndPriceContainer>

        <TripContainer
          style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
        >
          <TripAvailableSeats>
            <Text
              style={{
                textAlign: "left",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              Описание:
            </Text>
          </TripAvailableSeats>
        </TripContainer>

        <View
          style={{
            backgroundColor: "#f9fafb",
            borderBottomLeftRadius: 8,
            borderBottomRightRadius: 8,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: "#e5e7eb",
          }}
        >
          <TripDetailsDescription>
            {trip.trip_description}
          </TripDetailsDescription>
        </View>

        <TripContainer style={{ borderWidth: 1, borderColor: "#e5e7eb" }}>
          <TripAvailableSeats
            style={{
              textAlign: "left",
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            Свободни места: {trip.available_seats}
          </TripAvailableSeats>
        </TripContainer>

        {/* Taken Seats Toggle */}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 8,
          }}
        >
          <TouchableOpacity
            onPress={() => setShowPassengerList((prev) => !prev)}
            style={{
              flex: 5,
              marginTop: 10,
              marginBottom: 10,
              backgroundColor: "lightgray",
              paddingVertical: 14,
              paddingHorizontal: 16,
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              borderWidth: 1,
              borderColor: "#e5e7eb",
            }}
          >
            <Text style={{ fontWeight: 600, fontSize: 16 }}>
              Заети места: {trip.taken_seats?.length || 0}
            </Text>
            <Ionicons
              name={
                showPassengerList
                  ? "chevron-up-outline"
                  : "chevron-down-outline"
              }
              size={20}
              color="#4b5563"
            />
          </TouchableOpacity>
          {loggedUserId === trip.driver_id && (
            <TouchableOpacity
              onPress={() => setShowAddPassengerModal(true)}
              style={{
                flex: 1,
                height: "auto",
                width: "auto",
                marginTop: 10,
                marginBottom: 10,
                backgroundColor: "#10b981",
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons name="person-add-outline" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>

        {showPassengerList && (
          <View style={{ marginTop: 10, marginBottom: 10 }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {trip.taken_seats?.map((id, index) => {
                const user = passengerInfo[id];
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() =>
                      setExpandedPassenger((prev) => (prev === id ? null : id))
                    }
                    style={{
                      alignItems: "center",
                      marginRight: 10,
                      marginBottom: 10,
                    }}
                  >
                    <Image
                      source={{
                        uri:
                          `${baseAPIUrl}${user?.profile_image}` ??
                          `${baseAPIUrl}/uploads/unknown.jpg`,
                      }}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 30,
                        borderWidth: 2,
                        borderColor: "#6d28d9",
                      }}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Information Box - shown below the avatars when clicked */}
            {expandedPassenger && passengerInfo[expandedPassenger] && (
              <View
                style={{
                  marginTop: 10,
                  backgroundColor: "#fde68a",
                  padding: 15,
                  borderRadius: 8,
                  width: "100%",
                }}
              >
                <Text style={{ fontWeight: "bold" }}>
                  Имена: {passengerInfo[expandedPassenger]?.name}
                </Text>
                <Text>
                  Имейл: {passengerInfo[expandedPassenger]?.credentials.email}
                </Text>
                <Text>
                  Телефон: {passengerInfo[expandedPassenger]?.credentials.phone}
                </Text>
              </View>
            )}
          </View>
        )}

        <View
          key={section.id}
          style={{
            marginBottom: 10,
            backgroundColor: "#f9fafb",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#e5e7eb",
            overflow: "hidden",
          }}
        >
          <TouchableOpacity
            onPress={() => toggleSection(section.id)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 14,
              paddingHorizontal: 16,
              backgroundColor: "lightgray",
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}>
              {section.title}
            </Text>
            <Ionicons
              name={
                expandedSection === section.id
                  ? "chevron-up-outline"
                  : "chevron-down-outline"
              }
              size={20}
              color="#4b5563"
            />
          </TouchableOpacity>

          {expandedSection === section.id && (
            <View style={{ padding: 16, backgroundColor: "#ffffff" }}>
              {paymentOptions.card &&
              paymentOptions.card.length > 0 &&
              paymentOptions.card[0] !== "" ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Ionicons
                    name="card-outline"
                    size={18}
                    color="#6b7280"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ color: "#374151", fontSize: 14 }}>
                    {paymentOptions.card.join(", ")}
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <Ionicons
                    name="card-outline"
                    size={18}
                    color="#6b7280"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ color: "#374151", fontSize: 14 }}>
                    Не е възможно
                  </Text>
                </View>
              )}

              {paymentOptions.cash &&
              paymentOptions.cash.length > 0 &&
              paymentOptions.cash[0] !== "" ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="cash-outline"
                    size={18}
                    color="#6b7280"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ color: "#374151", fontSize: 14 }}>
                    {paymentOptions.cash.join(", ")}
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="cash-outline"
                    size={18}
                    color="#6b7280"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={{ color: "#374151", fontSize: 14 }}>
                    Не е възможно
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        <Line style={{ marginBottom: 0 }}></Line>
        {/* Driver Information */}
        {driver && (
          <ContactInfoContainer style={{ marginTop: 32, marginBottom: 0 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 16,
              }}
            >
              Информация за шофьора
            </Text>
            <ContactRowStyle>
              <Ionicons
                name="person-outline"
                size={20}
                color="#4b5563"
                style={{ marginRight: 10 }}
              />
              <Text style={{ color: "#374151", fontSize: 14 }}>
                {driver.name}
              </Text>
            </ContactRowStyle>

            <ContactRowStyle>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#4b5563"
                style={{ marginRight: 10 }}
              />
              <Text style={{ color: "#374151", fontSize: 14 }}>
                {driver.credentials.email}
              </Text>
            </ContactRowStyle>

            <ContactRowStyle>
              <Ionicons
                name="call-outline"
                size={20}
                color="#4b5563"
                style={{ marginRight: 10 }}
              />
              <Text style={{ fontSize: 14, color: "#2563eb" }}>
                {driver.credentials.phone}
              </Text>
            </ContactRowStyle>

            <ContactRowStyle>
              <Ionicons
                name="star-outline"
                size={20}
                color="#4b5563"
                style={{ marginRight: 10 }}
              />
              <Text style={{ color: "#374151", fontSize: 14 }}>
                {driver.ratings.average} / 5.00 ( {driver.ratings.count}{" "}
                рейтинга )
              </Text>
            </ContactRowStyle>
          </ContactInfoContainer>
        )}

        {loggedUserId !== trip.driver_id ? (
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly",
            }}
          >
            {trip.taken_seats.includes(loggedUserId) && (
              <TouchableOpacity
                style={{
                  height: 50,
                  width: 150,
                  marginTop: 20,
                  backgroundColor: "#6d28d9",
                  padding: 15,
                  borderRadius: 10,
                }}
                onPress={() => setShowRatingModal(true)}
              >
                <Text style={{ color: "white", textAlign: "center" }}>
                  Оцени шофьора
                </Text>
              </TouchableOpacity>
            )}

            {trip.taken_seats.includes(loggedUserId) ? (
              <TouchableOpacity
                style={{
                  height: 50,
                  width: 150,
                  marginTop: 20,
                  backgroundColor: "red",
                  padding: 15,
                  borderRadius: 10,
                }}
                onPress={() => outrollFromATrip(loggedUserId, trip._id)}
              >
                <Text style={{ color: "white", textAlign: "center" }}>
                  Откажи се
                </Text>
              </TouchableOpacity>
            ) : (
              trip.article_status === "available" && (
                <TouchableOpacity
                  style={{
                    height: 50,
                    width: 150,
                    marginTop: 20,
                    backgroundColor: "#facc15",
                    padding: 15,
                    borderRadius: 10,
                  }}
                  onPress={() => enrollInATrip(loggedUserId, trip._id)}
                >
                  <Text style={{ color: "white", textAlign: "center" }}>
                    Резервирай
                  </Text>
                </TouchableOpacity>
              )
            )}
          </View>
        ) : loggedUserId === trip.driver_id &&
          trip.article_status !== "finished" ? (
          /* Driver and article is not finished → show archive button */
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly",
            }}
          >
            {trip.article_status === "available" && (
              <TouchableOpacity
                style={{
                  height: 50,
                  width: 150,
                  marginTop: 20,
                  backgroundColor: "#facc15",
                  padding: 15,
                  borderRadius: 10,
                }}
                onPress={handleOnGoingTrip}
              >
                <Text style={{ color: "white", textAlign: "center" }}>
                  Започни
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={{
                height: 50,
                width: 150,
                marginTop: 20,
                backgroundColor: "red",
                padding: 15,
                borderRadius: 10,
              }}
              onPress={handleFinishTrip}
            >
              <Text style={{ color: " ", textAlign: "center" }}>Приключи</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <Modal
          visible={showAddPassengerModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAddPassengerModal(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                padding: 20,
                borderRadius: 10,
                width: 300,
              }}
            >
              <Text style={{ fontSize: 18, marginBottom: 10 }}>
                Добавяне на пътник
              </Text>
              <TextInput
                placeholder="Имена"
                value={manualPassengerNames}
                onChangeText={setManualPassengerNames}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  padding: 10,
                  marginBottom: 15,
                  borderRadius: 5,
                }}
              />
              <TextInput
                placeholder="Имейл"
                value={manualPassengerEmail}
                onChangeText={setManualPassengerEmail}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  padding: 10,
                  marginBottom: 15,
                  borderRadius: 5,
                }}
              />
              <TextInput
                placeholder="Телефон"
                value={manualPassengerPhone}
                onChangeText={setManualPassengerPhone}
                style={{
                  borderWidth: 1,
                  borderColor: "#ccc",
                  padding: 10,
                  marginBottom: 15,
                  borderRadius: 5,
                }}
              />

              <TouchableOpacity
                style={{
                  backgroundColor: "#6d28d9",
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 5,
                }}
                onPress={async () => {
                  const result = await addPassengerToTrip(
                    trip._id,
                    manualPassengerNames,
                    manualPassengerEmail,
                    manualPassengerPhone
                  );
                  if (result.success) {
                    Alert.alert("Успех", result.message, [
                      {
                        text: "OK",
                        onPress: () => navigation.goBack(),
                      },
                    ]);
                  } else {
                    Alert.alert("Грешка", result.message, [
                      {
                        text: "OK",
                        onPress: () => navigation.goBack(),
                      },
                    ]);
                  }
                  setShowAddPassengerModal(false);
                }}
              >
                <Text style={{ color: "white", textAlign: "center" }}>
                  Добави
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showRatingModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowRatingModal(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                padding: 20,
                borderRadius: 10,
                alignItems: "center",
                width: 250,
              }}
            >
              <Text style={{ fontSize: 18, marginBottom: 10 }}>
                Оцени шофьора
              </Text>
              <View style={{ flexDirection: "row", marginBottom: 20 }}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <TouchableOpacity
                    key={num}
                    onPress={() => setSelectedRating(num)}
                    style={{
                      margin: 5,
                      padding: 10,
                      backgroundColor:
                        selectedRating === num ? "#6d28d9" : "#e5e7eb",
                      borderRadius: 5,
                    }}
                  >
                    <Text
                      style={{
                        color: selectedRating === num ? "white" : "#111827",
                      }}
                    >
                      {num}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: "#6d28d9",
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 5,
                }}
                onPress={async () => {
                  const newAverageRating =
                    (selectedRating + driver.ratings.average) / 2;

                  /* insure average rating is max 5 */
                  if (newAverageRating > 5.0) {
                    newAverageRating = 5.0;
                  }

                  const result = await updateUserRating(
                    driver._id,
                    newAverageRating,
                    driver.ratings.count + 1
                  );

                  if (result == "SUCCESS") {
                    /* update driver's rating and count for this screen */
                    driver.ratings.average = newAverageRating;
                    driver.ratings.count += 1;
                  }
                  setShowRatingModal(false);
                }}
              >
                <Text style={{ color: "white" }}>Запази</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </TripDetailsContainer>
    </ScrollView>
  );
}

const contactTextStyle = {
  color: "#374151",
  fontSize: 14,
};
