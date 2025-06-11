import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text } from "react-native";

import {
  Colors,
  EmailText,
  HeaderContainer,
  NameText,
  ProfileImage,
  TextGroup,
} from "./../components/styles";

const { primary } = Colors;

import { baseAPIUrl } from "@/components/shared";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import Home from "../screens/components/Home/Home";
import More from "../screens/components/More/More";
import Profile from "../screens/components/Profile/Profile";
import Trips from "../screens/components/Trips/Trips";

const Tab = createBottomTabNavigator();

const CustomHeader = ({ name, email, imageUri }) => {
  const source =
    typeof imageUri === "string" && imageUri.length > 0
      ? { uri: `${baseAPIUrl}${imageUri}` }
      : imageUri;

  return (
    <HeaderContainer>
      <ProfileImage source={source} />
      <TextGroup>
        <NameText>{name}</NameText>
        <EmailText>{email}</EmailText>
      </TextGroup>
    </HeaderContainer>
  );
};

const HomeTabs = ({ route }) => {
  const id = route?.params?.id ?? "";
  const photoUrl = route?.params?.profileImage ?? "";
  const name = route?.params?.name ?? "";
  const email = route?.params?.email ?? "";
  const roles = route?.params?.roles;

  const [headerData, setHeaderData] = useState({
    name: route?.params?.name ?? "",
    email: route?.params?.email ?? "",
    photo: route?.params?.profileImage ?? "",
  });

  useFocusEffect(
    useCallback(() => {
      setHeaderData({
        name: route?.params?.name ?? "",
        email: route?.params?.email ?? "",
        photo: route?.params?.profileImage ?? "",
      });
    }, [route?.params])
  );

  return (
    <>
      <StatusBar style={primary} hidden={false} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size, focused }) => {
            let iconName;

            switch (route.name) {
              case "Home":
                iconName = focused ? "home" : "home-outline";
                break;
              case "Trips":
                iconName = focused ? "trail-sign" : "trail-sign-outline";
                break;
              case "Profile":
                iconName = focused ? "person" : "person-outline";
                break;
              case "More":
                iconName = focused ? "options" : "options-outline";
                break;
              default:
                iconName = "help-outline";
                break;
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarLabel: ({ children, color, focused }) => (
            <Text
              style={{
                fontSize: 10,
                color,
                fontWeight: focused ? "bold" : "normal",
              }}
            >
              {children}
            </Text>
          ),
          tabBarStyle: styles.tabBarStyle,
          tabBarItemStyle: styles.tabBarItemStyle,
          tabBarActiveBackgroundColor: "#ca8a04",
          tabBarActiveTintColor: "#ffffff",
          tabBarInactiveTintColor: "#0007",
          // headerShown: route.headerShown /* from route determine wheather to show header */,
          // headerShown: route.name === 'More' ? false : true /* hide header to MORE tab */,
          headerTintColor: "#ca8a04",
          headerTransparent: false,
          headerTitle: () => {
            if (route.name === "More") {
              return (
                <Text style={{ fontSize: 20, fontWeight: "600" }}>
                  Additional Information
                </Text>
              );
            } else if (route.name === "Profile") {
              return (
                <Text style={{ fontSize: 20, fontWeight: "600" }}>
                  Profile Settings
                </Text>
              );
              // } else if (route.name === "Trips") {
              //   return (
              //     <Text style={{ fontSize: 20, fontWeight: "600" }}>
              //       Trips Conf
              //     </Text>
              //   );
            } else {
              return (
                <CustomHeader
                  name={headerData.name || "Guest"}
                  email={headerData.email || "guest@example.com"}
                  imageUri={
                    headerData.photo
                      ? headerData.photo
                      : require("./../assets/images/logo.png")
                  }
                />
              );
            }
          },

          headerTitleAlign:
            route.name === "More" || route.name === "Profile"
              ? "center"
              : "left",
          headerStyle: styles.headerStyle /* to get rid of the header in iOS */,
        })}
      >
        <Tab.Screen
          name="Home"
          component={Home}
          initialParams={{
            id,
            name,
          }}
          options={{
            headerStyle: {
              backgroundColor: "#facc15",
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
          }}
        />

        <Tab.Screen
          name="Trips"
          component={Trips}
          initialParams={{
            id,
            email,
            roles,
          }}
          options={({ route }) => ({
            headerStyle: {
              backgroundColor: "#facc15",
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
          })}
        />

        <Tab.Screen
          name="Profile"
          component={Profile}
          initialParams={{
            id,
            name,
            email,
            photoUrl: photoUrl
              ? photoUrl
              : require("./../assets/images/no_image.jpeg"),
            roles,
          }}
          options={{
            headerStyle: {
              backgroundColor: "#facc15",
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
          }}
        />

        <Tab.Screen
          name="More"
          component={More}
          options={{
            headerStyle: {
              backgroundColor: "#facc15",
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 0,
            },
          }}
        />
      </Tab.Navigator>
    </>
  );
};

const styles = StyleSheet.create({
  tabBarStyle: {
    height: 70,
    backgroundColor: "#fefce8",
    position: "absolute",
    bottom: 10,
    left: 30,
    right: 30,
    borderRadius: 40,
    borderTopWidth: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5 /* to achieve something for the shadow properties in Android */,
  },
  tabBarItemStyle: {
    margin: 10,
    borderRadius: 40,
    overflow: "hidden",
  },
  headerStyle: {
    backgroundColor: "#fff8",
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
});

export default HomeTabs;
