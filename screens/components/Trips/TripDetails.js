import { baseAPIUrl } from "@/components/shared";
import { Ionicons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import axios from "axios";
import React, { useEffect, useState } from "react";

import {
  Image,
  ScrollView,
  StatusBar,
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
  <StatusBar
    backgroundColor="transparent"
    barStyle="dark-content"
    translucent
  />;

  const route = useRoute();
  const { tripData } = route.params;

  const [trip, setTrip] = useState(tripData || {}); /* safe aproach */
  const [driver, setDriver] = useState(trip?.driver || {}); /* safe aproach */
  const [passengerInfo, setPassengerInfo] = useState({});
  const [showPassengerList, setShowPassengerList] = useState(false);
  const [expandedPassenger, setExpandedPassenger] = useState(null);

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
          <Text
            style={{
              color: "#111827",
              fontWeight: "bold",
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              paddingTop: 10,
              paddingRight: 20,
              paddingBottom: 10,
              paddingLeft: 20,
              borderRadius: 8,
              zIndex: 1,
            }}
          >
            Image of the vehicle you would travel with:
          </Text>

          {/* Image below the text */}
          {trip && trip.vehicle_image ? (
            <Image
              source={{ uri: trip.vehicle_image }}
              style={{
                width: "100%",
                height: 200,
                borderRadius: 12,
                marginTop: 5,
              }}
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

        <TripContainer>
          <TripAvailableSeats>
            <Text
              style={{
                textAlign: "left",
                fontSize: 16, // Optional: Adjust the font size
                fontWeight: "bold", // Optional: Makes text bold for emphasis
              }}
            >
              Description:
            </Text>
          </TripAvailableSeats>
        </TripContainer>

        <TripDetailsDescription>{trip.trip_description}</TripDetailsDescription>

        <View
          key={section.id}
          style={{
            marginBottom: 15,
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

        <TripContainer>
          <TripAvailableSeats>
            <Text
              style={{
                textAlign: "left",
                fontSize: 16, // Optional: Adjust the font size
                fontWeight: "bold", // Optional: Makes text bold for emphasis
              }}
            >
              Available Seats: {trip.available_seats}
            </Text>
          </TripAvailableSeats>
        </TripContainer>

        {/* Taken Seats Toggle */}
        <TouchableOpacity
          onPress={() => setShowPassengerList((prev) => !prev)}
          style={{
            marginTop: 10,
            backgroundColor: "lightgray",
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontWeight: "bold", fontSize: 16 }}>
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
          <View style={{ marginTop: 10 }}>
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
                  backgroundColor: "lightgray",
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

        <TouchableOpacity
          style={{
            marginTop: 20,
            backgroundColor: "#6d28d9",
            padding: 15,
            borderRadius: 10,
          }}
          onPress={() => navigation.navigate("Booking", { tripId: trip._id })}
        >
          <Text style={{ color: "white", textAlign: "center" }}>
            Book This Trip
          </Text>
        </TouchableOpacity>
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
