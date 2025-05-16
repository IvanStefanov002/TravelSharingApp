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

import Home from "../screens/components/Home/Home";
import More from "../screens/components/More/More";
import Profile from "../screens/components/Profile/Profile";
import Trips from "../screens/components/Trips/Trips";

const Tab = createBottomTabNavigator();

const CustomHeader = ({ name, email, imageUri }) => (
  <HeaderContainer>
    <ProfileImage source={imageUri} />
    <TextGroup>
      <NameText>{name}</NameText>
      <EmailText>{email}</EmailText>
    </TextGroup>
  </HeaderContainer>
);

const HomeTabs = ({ route }) => {
  const id = route?.params?.id ?? "0";
  const photoUrl = route?.params?.profileImage ?? "";
  const name = route?.params?.name ?? "John Doe";
  const email = route?.params?.email ?? "john@example.com";
  const rating = route?.params?.rating;
  const tripsCount = route?.params?.tripsCount;
  const roles = route?.params?.roles;

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
          //headerShown: route.headerShown /* from route determine wheather to show header */,
          //headerShown: route.name === 'More' ? false : true /* hide header to MORE tab */,
          headerTintColor: "#ca8a04",
          headerTransparent: false,
          headerTitle: () => {
            if (route.name === "More") {
              return (
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  Additional Information
                </Text>
              );
            } else if (route.name === "Profile") {
              return (
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  Profile Settings
                </Text>
              );
            } else {
              return (
                <CustomHeader
                  name={name}
                  email={email}
                  imageUri={
                    photoUrl
                      ? { uri: photoUrl }
                      : require("./../assets/images/logo.png")
                  }
                />
              );
            }
          },
          headerTitleAlign:
            route.name === "More" ||
            route.name === "Profile" ||
            route.name === "Trips"
              ? "center"
              : "left",
          headerStyle: styles.headerStyle /* to get rid of the header in iOS */,
        })}
      >
        <Tab.Screen
          name="Home"
          component={Home}
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
          }}
          options={({ route }) => ({
            headerShown: route.params?.showHeader ?? false, // Default to false if not passed
          })}
        />

        <Tab.Screen
          name="Profile"
          component={Profile}
          initialParams={{
            name,
            email,
            photoUrl: photoUrl
              ? { uri: photoUrl }
              : require("./../assets/images/logo.png"),
            rating,
            tripsCount,
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
        {/* <Tab.Screen
        name="More"
        component={More}
        options={({ route }) => ({
          headerShown: route.params?.showHeader ?? false, // Default to false if not passed
        })}
      /> */}
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
    borderBottomWidth: 0,
    shadowColor: "transparent",
    shadowOpacity: 0,
    elevation: 0,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  profileImage: {
    width: 35,
    height: 35,
    borderRadius: 18,
    marginRight: 10,
  },
  nameText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  emailText: {
    fontSize: 12,
    color: "gray",
  },
  headerStyle: {
    backgroundColor: "#fff8",
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 0,
  },
});

export default HomeTabs;
