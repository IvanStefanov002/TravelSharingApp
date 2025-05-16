import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";

import { resetLoginScreen } from "../../../utils/resetLoginScreen";

/* api url */
import { baseAPIUrl } from "../../../components/shared";

import axios from "axios";
import {
  AvatarProfile,
  MenuItem,
  MenuSection,
  MenuText,
  ProfileContainer,
  ProfileEmail,
  ProfileName,
  ProfileRole,
  ProfileRoleAndRatingContainer,
  ProfileRoleButton,
  ProfileSection,
  RoleColoredText,
} from "../../../components/styles";

export default function Profile({ navigation, route }) {
  const { roles, name, email, photoUrl, rating, tripsCount } = route.params;
  const [user, setUser] = useState({
    roles: roles ? roles : [],
    name,
    email,
    imageUri: photoUrl,
    rating: rating ? rating : 0,
    tripsCount: tripsCount ? tripsCount : 0,
  });

  const [isEditingRoles, setIsEditingRoles] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState(user.roles);

  const toggleRole = (role) => {
    setSelectedRoles((prev) => {
      const filtered = prev.filter((r) => r !== role);
      return prev.includes(role) ? filtered : [...filtered, role];
    });
  };

  const saveRoles = async () => {
    const url = `${baseAPIUrl}/users/updateRoles`;

    try {
      const response = await axios.post(url, {
        email: user.email,
        roles: selectedRoles,
      });

      if (response.data.statusText === "SUCCESS") {
        Alert.alert("Success", "Your roles were updated!");
        setUser((prevUser) => ({
          ...prevUser,
          roles: selectedRoles,
        }));
        setIsEditingRoles(false);
      } else {
        Alert.alert("Failed to update roles");
      }
    } catch (error) {
      Alert.alert("Error updating roles");
    }
  };

  const menuItems = [
    {
      id: "1",
      label: "Security",
      icon: "shield-outline",
      onPress: () => {
        navigation.navigate("Security", { email: user.email });
      },
    },
    //{ id: "3", label: "Trip History", icon: "time-outline", onPress: () => {} },
    //{ id: "4", label: "Ratings", icon: "star-outline", onPress: () => {} },
    {
      id: "5",
      label: "Logout",
      icon: "log-out-outline",
      onPress: () => {
        resetLoginScreen(navigation);
      },
    },
  ];

  if (user.roles.includes("passenger")) {
    menuItems.splice(1, 0, {
      id: "3",
      label: "Trip History",
      icon: "time-outline",
      onPress: () => {
        navigation.navigate("TripHistory", { email: user.email });
      },
    });
  }

  // Conditionally add the "Trip History" item if the user is a "driver"
  if (user.roles.includes("driver")) {
    menuItems.splice(1, 0, {
      id: "2",
      label: "About my vehicle",
      icon: "car-sport-outline",
      onPress: () => {
        navigation.navigate("AboutVehicle", { email: user.email });
      },
    }),
      menuItems.splice(1, 0, {
        id: "4",
        label: "Ratings",
        icon: "star-outline",
        onPress: () => {
          navigation.navigate("Ratings", { email: user.email });
        },
      });
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <ProfileContainer>
        <ProfileSection>
          <AvatarProfile source={user.imageUri} />
          <ProfileName>{user.name}</ProfileName>
          <ProfileEmail>{user.email}</ProfileEmail>
        </ProfileSection>

        <ProfileRoleAndRatingContainer>
          <ProfileRole>
            Role(s):{" "}
            <RoleColoredText>{selectedRoles.join(" & ")}</RoleColoredText>
          </ProfileRole>
          <ProfileRoleButton onPress={() => setIsEditingRoles(!isEditingRoles)}>
            <Ionicons
              name={user.roles.length === 0 ? "add" : "pencil"}
              size={20}
              color="#333"
            />
          </ProfileRoleButton>
        </ProfileRoleAndRatingContainer>

        {isEditingRoles && (
          <View style={{ flexDirection: "row", marginVertical: 10 }}>
            {["driver", "passenger"].map((roleOption) => (
              <ProfileRoleButton
                key={roleOption}
                onPress={() => toggleRole(roleOption)}
                style={{
                  backgroundColor: selectedRoles.includes(roleOption)
                    ? "#b2f2bb"
                    : "#ffe0e0",
                }}
              >
                <MenuText>{roleOption}</MenuText>
              </ProfileRoleButton>
            ))}
            <ProfileRoleButton
              onPress={saveRoles}
              style={{ backgroundColor: "#d0f0c0" }}
            >
              <Ionicons name="checkmark" size={20} color="#333" />
            </ProfileRoleButton>
          </View>
        )}

        <MenuSection>
          {menuItems.map((item) => (
            <MenuItem
              key={item.id}
              onPress={item.onPress}
              style={item.id === "5" ? { backgroundColor: "#ffe0e0" } : {}}
            >
              <Ionicons name={item.icon} size={20} color={"#333"} />
              <MenuText>{item.label}</MenuText>
            </MenuItem>
          ))}
        </MenuSection>
      </ProfileContainer>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  logoutItem: {
    backgroundColor: "#fef2f2", // Light red background
  },
});
