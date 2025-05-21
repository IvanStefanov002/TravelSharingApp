import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { useCallback, useState } from "react";
import { StatusBar } from "react-native";
import { baseAPIUrl } from "../../../components/shared";

import { Line } from "@/components/styles";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const TripHistory = ({ route }) => {
  StatusBar.setHidden(true);

  const userId = route?.params?.id ?? "undefined";

  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("FAILED");

  const [hostedTrips, setHostedTrips] = useState([]);
  const [joinedTrips, setJoinedTrips] = useState([]);

  // Fetch data when screen is focused
  useFocusEffect(
    useCallback(() => {
      const fetchTrips = async () => {
        try {
          setIsLoading(true);

          const response = await axios.get(
            `${baseAPIUrl}/trips/fetchData/${userId}`
          );

          const trips = response.data.map((trip) => {
            if (trip.departure_datetime) {
              trip.departure_datetime = trip.departure_datetime
                .replace("T", " ")
                .replace("Z", "");
            }

            if (trip.vehicle_image) {
              trip.vehicle_image = trip.vehicle_image.replace(
                "http://localhost:3000",
                baseAPIUrl
              );
            }

            return trip;
          });

          // Categorize trips
          const hosted = trips.filter((trip) => trip.driver_id === userId);
          const joined = trips.filter((trip) =>
            trip.taken_seats?.includes(userId)
          );

          setHostedTrips(hosted);
          setJoinedTrips(joined);
        } catch (error) {
          console.error("Error fetching trips:", error.message);
          setMessage("Error loading trips.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchTrips();
    }, [route.params?.activeTab])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#6d28d9" />
      ) : (
        <>
          {/* Hosted Trips */}
          <Text style={styles.sectionTitle}>Trips You've Hosted</Text>
          <Line></Line>
          {hostedTrips.length > 0 ? (
            hostedTrips.map((trip) => (
              <View style={styles.card} key={trip._id}>
                <Image
                  source={{ uri: trip.vehicle_image }}
                  style={styles.image}
                />
                <View style={styles.details}>
                  <Text style={styles.title}>{trip.title}</Text>
                  <Text style={styles.meta}>
                    Direction: {trip.start_location.city} →{" "}
                    {trip.end_location.city}
                  </Text>
                  <Text style={styles.meta}>
                    Departure: {trip.departure_datetime}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No hosted trips found.</Text>
          )}

          {/* Participated Trips */}
          <Text style={styles.sectionTitle}>Trips You've Participated In</Text>
          <Line></Line>
          {joinedTrips.length > 0 ? (
            joinedTrips.map((trip) => (
              <View style={styles.card} key={trip._id}>
                <Image
                  source={{ uri: trip.vehicle_image }}
                  style={styles.image}
                />
                <View style={styles.details}>
                  <Text style={styles.title}>{trip.title}</Text>
                  {/* <Text>{trip.trip_description}</Text> */}
                  <Text style={styles.meta}>
                    Direction: {trip.start_location.city} →{" "}
                    {trip.end_location.city}
                  </Text>
                  <Text style={styles.meta}>
                    Departure: {trip.departure_datetime}
                  </Text>
                  {/* <Text style={styles.meta}>
                    Driver Rating: {trip.rating ?? "N/A"}
                  </Text> */}
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No participated trips found.</Text>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    paddingTop: 70,
    backgroundColor: "#f9f9f9",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    color: "#333",
    alignSelf: "center",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginBottom: 15,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: 150,
    height: 150,
    //resizeMode: "stretch",
    resizeMode: "contain",
  },
  details: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
  },
  meta: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
    fontWeight: 500,
  },
  emptyText: {
    color: "#888",
    fontStyle: "italic",
    marginBottom: 10,
    textAlign: "center",
  },
});

export default TripHistory;
