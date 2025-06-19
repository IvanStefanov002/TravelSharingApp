import React from "react";

import { Colors } from "./../components/styles";

const { primary, tertiary } = Colors;

/* React navigation */
import {
  NavigationContainer,
  NavigationIndependentTree,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

/* screens */
import AboutVehicle from "../screens/components/Profile/AboutVehicle";
import Security from "../screens/components/Profile/Security";
import TripHistory from "../screens/components/Profile/TripHistory";
import Verification from "../screens/LinkVerification";
import Login from "./../screens/Login";
import Signup from "./../screens/Signup";

import TripDetails from "./../screens/components/Trips/TripDetails";

import HomeTabs from "./../navigators/HomeTabs";

const Stack = createNativeStackNavigator();

const RootStack = () => {
  return (
    <NavigationIndependentTree>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: "transparent" },
            headerTintColor: tertiary,
            //headerTransparent: true,
            /* headerTitle: "", */
            headerLeftContainerStyle: { paddingLeft: 20 },
          }}
          initialRouteName="Login"
        >
          <Stack.Screen
            name="Login"
            component={Login}
            options={{
              title: "",
              //statusBarTranslucent: true,
              headerTransparent: true,
            }}
          />
          <Stack.Screen
            name="Signup"
            component={Signup}
            options={{
              title: "",
              //statusBarTranslucent: true,
              headerTransparent: true,
            }}
          />

          <Stack.Screen
            name="TripDetails"
            component={TripDetails}
            options={{
              title: "",
              headerShown: true,
              headerTransparent: false,
              headerShadowVisible: false,
              headerStyle: {
                backgroundColor: "#facc15",
                statusBarStyle: "light",
              },
              statusBarHidden: false,
            }}
          />

          <Stack.Screen
            name="Verification"
            component={Verification}
            options={{ title: "", headerTransparent: true }}
          />

          <Stack.Screen
            name="Security"
            component={Security}
            options={{
              title: "Настройки за сигурност",
              headerTintColor: "black",
              headerStyle: {
                backgroundColor: "#facc15",
              },
            }}
          />

          <Stack.Screen
            name="TripHistory"
            component={TripHistory}
            options={{
              title: "История на пътуванията",
              headerTintColor: "black",
              headerStyle: {
                backgroundColor: "#facc15",
              },
              statusBarStyle: "light",
            }}
          />

          <Stack.Screen
            name="AboutVehicle"
            component={AboutVehicle}
            options={{
              title: "Моите превозни средства",
              statusBarStyle: "auto",
              headerStyle: {
                backgroundColor: "#facc15",
              },
              /* statusBarHidden: true, */
            }}
          />

          <Stack.Screen
            name="HomeTabs"
            component={HomeTabs}
            initialParams={{
              name: "Guest",
              email: "guest@example.com",
              photoUrl: null,
            }}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </NavigationIndependentTree>
  );
};

export default RootStack;
