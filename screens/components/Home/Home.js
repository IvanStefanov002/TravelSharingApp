import { baseAPIUrl } from "@/components/shared";
import { fetchUserDataById } from "@/utils/fetchUserDataById";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import React, { useCallback, useState } from "react";
import { Dimensions, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";
import {
  ChartContainer,
  CTAButton,
  CTAButtonsContainer,
  CTAButtonText,
  Header,
  HomeContainer,
  HomeSectionTitle,
  StatCard,
  StatCardsContainer,
  StatText,
  WelcomeText,
} from "../../../components/styles";

const screenWidth = Dimensions.get("window").width;

export default function Home({ route, navigation }) {
  const { tempId } = route.params || {};
  const id = route?.params?.id ?? tempId;

  const [appStats, setAppStats] = useState({
    totalUsers: 0,
    totalTrips: 0,
    totalPassengers: 0,
  });

  const [user, setUser] = useState({
    id: "",
    name: "",
    roles: "",
    email: "",
    photoUrl: "",
  });

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          // Fetch user data
          const userData = await fetchUserDataById(id); // make sure this is async if needed

          const mappedUserData = {
            id: userData._id,
            name: userData.name,
            roles: userData.roles,
            email: userData.credentials.email,
            photoUrl: userData.profile_image,
          };

          setUser(mappedUserData);

          // Fetch app stats
          const response = await axios.get(`${baseAPIUrl}/stats/summary`);
          setAppStats(response.data);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }, [id]) // Include `id` as a dependency
  );

  /* to be done if it has to be done */
  const chartData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    datasets: [
      {
        data: [3, 5, 2, 4, 6],
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView>
      <HomeContainer>
        <Header>
          <WelcomeText>
            Welcome back,{" "}
            <WelcomeText style={{ fontWeight: 600 }}>
              {user.name.split(" ")[0] || "Traveler"}
            </WelcomeText>
          </WelcomeText>
        </Header>

        <HomeSectionTitle>App-wide Statistics</HomeSectionTitle>
        <StatCardsContainer>
          <StatCard>
            <Ionicons name="person-circle-outline" size={24} color="white" />
            <StatText>{appStats.totalUsers} Users</StatText>
          </StatCard>
          <StatCard style={{ backgroundColor: "#fde68a" }}>
            <Ionicons name="car-sport-outline" size={24} color="black" />
            <StatText style={{ color: "black" }}>
              {appStats.totalTrips} Rides
            </StatText>
          </StatCard>
          <StatCard style={{ backgroundColor: "#5b21b6" }}>
            <Ionicons name="people-outline" size={24} color="white" />
            <StatText>{appStats.totalPassengers} Passengers</StatText>
          </StatCard>
        </StatCardsContainer>

        <ChartContainer>
          <HomeSectionTitle>Weekly Ride Activity</HomeSectionTitle>
          <LineChart
            data={chartData}
            width={screenWidth - 60}
            height={220}
            chartConfig={{
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: () => "#6d28d9",
              labelColor: () => "#666",
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: "#6d28d9",
              },
            }}
            bezier
            style={{ borderRadius: 10 }}
          />
        </ChartContainer>

        <HomeSectionTitle>Quick Actions</HomeSectionTitle>
        <CTAButtonsContainer>
          <CTAButton
            onPress={() =>
              navigation.navigate("Trips", { activeTab: "create" })
            }
          >
            <CTAButtonText>Plan a Ride</CTAButtonText>
          </CTAButton>
          <CTAButton
            onPress={() =>
              navigation.navigate("Trips", { activeTab: "explore" })
            }
            style={{ backgroundColor: "#fde68a" }}
          >
            <CTAButtonText style={{ color: "black" }}>
              Find a Ride
            </CTAButtonText>
          </CTAButton>
        </CTAButtonsContainer>
      </HomeContainer>
    </ScrollView>
  );
}
