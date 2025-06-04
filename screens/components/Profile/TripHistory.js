import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import { useCallback, useState } from "react";
import { StatusBar } from "react-native";
import { baseAPIUrl } from "../../../components/shared";

import {
  Card,
  DetailsContainer,
  EmptyTextTh,
  ImageTh,
  Line,
  MetaTh,
  SectionTitleTH,
  TitleTh,
} from "@/components/styles";
import { ActivityIndicator, ScrollView, StyleSheet } from "react-native";

const TripHistory = ({ route }) => {
  StatusBar.setHidden(true);

  const userId = route?.params?.id ?? "undefined";
  const isDriver = route?.params?.roles.includes("driver") ? true : false;

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
              trip.vehicle_image = trip.vehicle_image;
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
          {isDriver && (
            <>
              {/* Hosted Trips */}
              <SectionTitleTH>Trips you've hosted</SectionTitleTH>
              <Line></Line>
              {hostedTrips.length > 0 ? (
                hostedTrips.map((trip) => (
                  <Card key={trip._id}>
                    <ImageTh
                      source={{ uri: `${baseAPIUrl}${trip.vehicle_image}` }}
                    />
                    <DetailsContainer>
                      <TitleTh>{trip.title}</TitleTh>
                      <MetaTh>
                        Direction: {trip.start_location.city} →{" "}
                        {trip.end_location.city}
                      </MetaTh>
                      <MetaTh>Departure: {trip.departure_datetime}</MetaTh>
                    </DetailsContainer>
                  </Card>
                ))
              ) : (
                <EmptyTextTh>No hosted trips found.</EmptyTextTh>
              )}
            </>
          )}

          {/* Participated Trips */}
          <SectionTitleTH>Trips You've Participated In</SectionTitleTH>
          <Line></Line>
          {joinedTrips.length > 0 ? (
            joinedTrips.map((trip) => (
              <Card key={trip._id}>
                <ImageTh
                  source={{ uri: `${baseAPIUrl}${trip.vehicle_image}` }}
                />
                <DetailsContainer>
                  <TitleTh>{trip.title}</TitleTh>
                  {/* <Text>{trip.trip_description}</Text> */}
                  <MetaTh>
                    Direction: {trip.start_location.city} →{" "}
                    {trip.end_location.city}
                  </MetaTh>
                  <MetaTh>Departure: {trip.departure_datetime}</MetaTh>
                </DetailsContainer>
              </Card>
            ))
          ) : (
            <EmptyTextTh>No participated trips found.</EmptyTextTh>
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
});

export default TripHistory;
