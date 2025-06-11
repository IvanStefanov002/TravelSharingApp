import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Alert, Button, Modal, ScrollView, Text, View } from "react-native";

import { resetLoginScreen } from "../../../utils/resetLoginScreen";

/* api url */
import { baseAPIUrl } from "../../../components/shared";

import { changeImage, pickImage } from "@/utils/imageHandlers";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  const { id, roles, name, email, photoUrl } = route.params;

  // da razucha useState kakvo pravi
  // zashto ima functionalni komponenti
  // zashto e function a ne klas

  const [modalVisible, setModalVisible] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [user, setUser] = useState({
    id: id,
    roles: roles ? roles : [],
    name,
    email,
    imageUrl: photoUrl,
  });

  const isImageSet = !photoUrl.includes("no_image");

  const [isEditingRoles, setIsEditingRoles] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState(user.roles);

  const toggleRole = (role) => {
    setSelectedRoles((prev) => {
      const filtered = prev.filter((r) => r !== role);
      return prev.includes(role) ? filtered : [...filtered, role];
    });
  };

  const saveRoles = async () => {
    const token = await AsyncStorage.getItem("token");
    const url = `${baseAPIUrl}/users/updateRoles`;

    try {
      const response = await axios.post(url, {
        email: user.email,
        roles: selectedRoles,
      });

      if (response.data.statusText === "SUCCESS") {
        const updatedUser = {
          ...user,
          roles: selectedRoles,
        };

        setUser(updatedUser);
        setIsEditingRoles(false);

        const data = {
          email: user.email,
          id: user.id,
          name: user.name,
          profileImage: user.imageUrl,
          roles: selectedRoles,
        };

        Alert.alert("Success", "Your roles were updated!", [
          {
            text: "OK",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: "HomeTabs", params: data }],
              });
            },
          },
        ]);
      } else {
        Alert.alert("Failed to update roles");
      }
    } catch (error) {
      Alert.alert("Error updating roles");
    }
  };

  const handlePickImage = async () => {
    console.log("HandlePickImage start...");

    let result;

    if (!isImageSet) {
      result = await pickImage(
        (newUri) => {
          if (newUri) {
            setUser((prev) => ({
              ...prev,
              imageUrl: newUri,
            }));
          }
        },
        route,
        setMessage,
        setMessageType
      );
    } else {
      result = await changeImage(
        user,
        setUser,
        route,
        setMessage,
        setMessageType
      );
    }

    setModalVisible(false);

    const data = [
      {
        email: user.email,
        id: user.id,
        name: user.name,
        profileImage: user.imageUrl,
        rating: 0,
        ratingsCount: 0,
        roles: user.roles,
      },
    ];

    /* Navigate to Homescreen( HomeTabs ) and pass parameters for the custom header to reload */
    if (result) {
      navigation.navigate("HomeTabs", { ...data[0] });
    }
  };

  const menuItems = [
    {
      id: "1",
      label: !isImageSet ? "Add profile picture" : "Change profile picture",
      icon: "image-outline",
      onPress: () => {
        setModalVisible(true); // opens modal
      },
    },

    {
      id: "2",
      label: "Security",
      icon: "shield-outline",
      onPress: () => {
        navigation.navigate("Security", { email: user.email });
      },
    },
    {
      id: "5",
      label: "Logout",
      icon: "log-out-outline",
      onPress: () => {
        resetLoginScreen(navigation);
      },
    },
  ];

  if (user.roles.includes("passenger") || user.roles.includes("driver")) {
    menuItems.splice(1, 0, {
      id: "4",
      label: "Trip History",
      icon: "time-outline",
      onPress: () => {
        navigation.navigate("TripHistory", { id: user.id, roles: user.roles });
      },
    });
  }

  // Conditionally add the "Trip History" item if the user is a "driver"
  if (user.roles.includes("driver")) {
    menuItems.splice(1, 0, {
      id: "3",
      label: "About my vehicles",
      icon: "car-sport-outline",
      onPress: () => {
        navigation.navigate("AboutVehicle", { email: user.email });
      },
    });
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <ProfileContainer>
        <ProfileSection>
          <AvatarProfile source={{ uri: `${baseAPIUrl}${user.imageUrl}` }} />
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

        {!user.roles.includes("passenger") &&
          !user.roles.includes("driver") && (
            <View style={{ paddingBottom: 10 }}>
              <Text
                style={{ fontSize: 16, fontWeight: 600, alignSelf: "center" }}
              >
                Tip: Please, select a role!
              </Text>
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              padding: 20,
              borderRadius: 10,
              width: "80%",
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", marginBottom: 20 }}
            >
              Change Profile Picture
            </Text>
            <Button title="Pick from Gallery" onPress={handlePickImage} />
            <View style={{ height: 10 }} />
            <Button
              title="Cancel"
              color="red"
              onPress={() => setModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
