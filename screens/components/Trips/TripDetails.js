import { baseAPIUrl } from "@/components/shared";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import React, { useEffect, useState } from "react";

import { updateTripStatus } from "@/utils/updateTripStatus";
import { updateUserRating } from "@/utils/updateUserRating";

import {
  Alert,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ContactInfoContainer,
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
  // <StatusBar
  //   backgroundColor="transparent"
  //   translucent
  // />;

  const route = useRoute();
  const { tripData } = route.params;
  const { loggedUserId } = route.params;

  const [trip, setTrip] = useState(tripData || {}); /* safe aproach */
  const [driver, setDriver] = useState(trip?.driver || {}); /* safe aproach */
  const [passengerInfo, setPassengerInfo] = useState({});
  const [showPassengerList, setShowPassengerList] = useState(false);
  const [expandedPassenger, setExpandedPassenger] = useState(null);

  /* for ratings */
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedRating, setSelectedRating] = useState(null);

  /* for card options */
  const [expandedSection, setExpandedSection] = useState(null);

  // Fetch trip details once when the component mounts
  useEffect(() => {
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

    fetchPassangerInfo();
  }, [trip._id]); // Dependency array with tripId ensures it's fetched once

  const toggleSection = (id) => {
    setExpandedSection((prev) => (prev === id ? null : id));
  };

  const handleFinishTrip = async () => {
    const result = await updateTripStatus(trip._id, "finished");

    if (result.success) {
      Alert.alert("Success", result.message, [
        {
          text: "OK",
          onPress: () =>
            navigation.navigate("HomeTabs", {
              screen: "Trips",
              params: { activeTab: "explore" },
            }),
        },
      ]);
    } else {
      Alert.alert("Error", result.message);
    }
  };

  const section = {
    id: "payment-methods",
    title: "Payment methods",
  };

  const paymentOptions = trip.checkout_options || {};

  // Make sure trip and driver exist before rendering.
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
          {/* Text above the image */}
          {/* <Text
            style={{
              color: "#111827",
              fontWeight: "bold",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              paddingTop: 10,
              paddingRight: 20,
              paddingBottom: 10,
              paddingLeft: 20,
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              zIndex: 1,
            }}
          >
            Vehicle image
          </Text> */}

          {/* Image below the text */}
          {trip && trip.vehicle_image ? (
            <Image
              source={{ uri: trip.vehicle_image }}
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
                {" per seat"}
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
              Description:
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
            Available Seats: {trip.available_seats}
          </TripAvailableSeats>
        </TripContainer>

        {/* Taken Seats Toggle */}
        <TouchableOpacity
          onPress={() => setShowPassengerList((prev) => !prev)}
          style={{
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
            Taken Seats: {trip.taken_seats?.length || 0}
          </Text>
          <Ionicons
            name={
              showPassengerList ? "chevron-up-outline" : "chevron-down-outline"
            }
            size={20}
            color="#4b5563"
          />
        </TouchableOpacity>

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
                          user?.profile_image ??
                          "https://via.placeholder.com/100x100.png?text=User",
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
                  Name: {passengerInfo[expandedPassenger]?.name}
                </Text>
                <Text>
                  Email: {passengerInfo[expandedPassenger]?.credentials.email}
                </Text>
                <Text>
                  Phone: {passengerInfo[expandedPassenger]?.credentials.phone}
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
                    Not available
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
                    Not available
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Driver Information */}
        {driver && (
          <ContactInfoContainer style={{ marginTop: 32 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#111827",
                marginBottom: 16,
              }}
            >
              Driver Information
            </Text>
            <View style={contactRowStyle}>
              <Ionicons
                name="person-outline"
                size={20}
                color="#4b5563"
                style={iconStyle}
              />
              <Text style={contactTextStyle}>{driver.name}</Text>
            </View>

            <View style={contactRowStyle}>
              <Ionicons
                name="mail-outline"
                size={20}
                color="#4b5563"
                style={iconStyle}
              />
              <Text style={contactTextStyle}>{driver.credentials.email}</Text>
            </View>

            <View style={contactRowStyle}>
              <Ionicons
                name="call-outline"
                size={20}
                color="#4b5563"
                style={iconStyle}
              />
              <Text style={[contactTextStyle, { color: "#2563eb" }]}>
                {driver.credentials.phone}
              </Text>
            </View>

            <View style={contactRowStyle}>
              <Ionicons
                name="star-outline"
                size={20}
                color="#4b5563"
                style={iconStyle}
              />
              <Text style={contactTextStyle}>
                {driver.ratings.average} ( {driver.ratings.count} ratings )
              </Text>
            </View>
          </ContactInfoContainer>
        )}

        {loggedUserId !== trip.driver_id ? (
          // Non-driver user buttons
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly",
            }}
          >
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
                Rate Driver
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                height: 50,
                width: 150,
                marginTop: 20,
                backgroundColor: "#facc15",
                padding: 15,
                borderRadius: 10,
              }}
              onPress={() =>
                navigation.navigate("Booking", { tripId: trip._id })
              }
            >
              <Text style={{ color: "white", textAlign: "center" }}>
                Book This Trip
              </Text>
            </TouchableOpacity>
          </View>
        ) : loggedUserId === trip.driver_id &&
          trip.article_status !== "finished" ? (
          // Driver and article is not finished → show archive
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-evenly",
            }}
          >
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
              <Text style={{ color: "white", textAlign: "center" }}>
                Archive Article
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

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
                Rate the Driver
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

                  console.log(result);

                  if (result == "SUCCESS") {
                    /* update driver's rating and count for this screen */
                    driver.ratings.average = newAverageRating;
                    driver.ratings.count += 1;
                  }
                  setShowRatingModal(false);
                }}
              >
                <Text style={{ color: "white" }}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </TripDetailsContainer>
    </ScrollView>
  );
}

const contactRowStyle = {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 12,
};

const contactTextStyle = {
  color: "#374151",
  fontSize: 14,
};

const iconStyle = {
  marginRight: 10,
};
