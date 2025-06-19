import { baseAPIUrl } from "@/components/shared";
import { fetchUserDataById } from "@/utils/fetchUserDataById";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";
import React, { useCallback, useState } from "react";
import {
  Alert,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
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

  const [isDriver, setIsDriver] = useState(false);

  const [weeklyChart, setWeeklyChart] = useState({
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    data: [0, 0, 0, 0, 0, 0, 0],
  });

  const sanitizeData = (arr) =>
    arr.map((n) => (typeof n === "number" && isFinite(n) ? n : 0));

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          // Fetch user
          const userData = await fetchUserDataById(id);
          const mappedUserData = {
            id: userData._id,
            name: userData.name,
            roles: userData.roles,
            email: userData.credentials.email,
            photoUrl: userData.profile_image,
          };

          setUser(mappedUserData);
          setIsDriver(mappedUserData.roles.includes("driver"));

          // Fetch general stats
          const statsRes = await axios.get(`${baseAPIUrl}/stats/summary`);
          setAppStats(statsRes.data);

          // Fetch weekly trip chart data
          const weeklyRes = await axios.get(`${baseAPIUrl}/stats/weeklyTrips`);
          const sanitizedChart = {
            labels: weeklyRes.data.labels ?? [],
            data: sanitizeData(weeklyRes.data.data),
          };
          setWeeklyChart(sanitizedChart);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }, [id])
  );

  // useFocusEffect(
  //   useCallback(() => {
  //     const fetchData = async () => {
  //       try {
  //         // Fetch user data
  //         const userData = await fetchUserDataById(id); // make sure this is async if needed

  //         const mappedUserData = {
  //           id: userData._id,
  //           name: userData.name,
  //           roles: userData.roles,
  //           email: userData.credentials.email,
  //           photoUrl: userData.profile_image,
  //         };

  //         setUser(mappedUserData);
  //         setIsDriver(mappedUserData.roles.includes("driver"));

  //         // Fetch app stats
  //         const response = await axios.get(`${baseAPIUrl}/stats/summary`);
  //         setAppStats(response.data);
  //       } catch (error) {
  //         console.error("Error fetching data:", error);
  //       }
  //     };

  //     fetchData();
  //   }, [id]) // Include `id` as a dependency
  // );

  /* to be done if it has to be done */
  const chartData = {
    labels: weeklyChart.labels,
    datasets: [
      {
        data: weeklyChart.data,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <ScrollView>
      <HomeContainer>
        <Header>
          <WelcomeText>
            Добре дошъл,{" "}
            <WelcomeText style={{ fontWeight: 600 }}>
              {user.name.split(" ")[0] || "Traveler"}
            </WelcomeText>
          </WelcomeText>
        </Header>

        <HomeSectionTitle>Глобални статистики</HomeSectionTitle>
        <StatCardsContainer>
          <StatCard>
            <Ionicons name="person-circle-outline" size={24} color="white" />
            <StatText>{appStats.totalUsers}</StatText>
          </StatCard>
          <StatCard style={{ backgroundColor: "#fde68a" }}>
            <Ionicons name="car-sport-outline" size={24} color="black" />
            <StatText style={{ color: "black" }}>
              {appStats.totalTrips}
            </StatText>
          </StatCard>
          <StatCard style={{ backgroundColor: "#5b21b6" }}>
            <Ionicons name="people-outline" size={24} color="white" />
            <StatText>{appStats.totalPassengers}</StatText>
          </StatCard>
        </StatCardsContainer>

        <ChartContainer>
          <HomeSectionTitle>
            Седмична статистика за създадени пътувания
          </HomeSectionTitle>
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

        <View style={{ display: "flex", flexDirection: "row" }}>
          <HomeSectionTitle>Бързи действия</HomeSectionTitle>
          {/* Info icon */}
          <TouchableOpacity
            onPress={() =>
              Alert.alert(
                "Информация за разделите",
                "• 'Намери пътуване' е разрешено за всички потребители на приложението.\n• 'Създай пътуване' е разрешено само за потребители, които имат роля 'шофьор'."
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
        <CTAButtonsContainer>
          <CTAButton
            onPress={() =>
              navigation.navigate("Пътувания", { activeTab: "explore" })
            }
          >
            <CTAButtonText>Намери пътуване</CTAButtonText>
          </CTAButton>
          <CTAButton
            onPress={() => {
              if (!isDriver) {
                Alert.alert(
                  "Информация за разделите",
                  "Трябва да имаш роля шофьор за да създадеш обява!"
                );
              } else {
                navigation.navigate("Пътувания", { activeTab: "create" });
              }
            }}
            style={{ backgroundColor: "#fde68a" }}
          >
            <CTAButtonText style={{ color: "black" }}>
              Създай пътуване
            </CTAButtonText>
          </CTAButton>
        </CTAButtonsContainer>
      </HomeContainer>
    </ScrollView>
  );
}
