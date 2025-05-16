import React, { useState } from "react";
import { Alert, StatusBar } from "react-native";
import {
  Button,
  ButtonText,
  Input,
  Section,
  SectionNote,
  SectionTitle,
  SecurityContainer,
  TitleRow,
} from "./../../../components/styles";

import KeyboardAvoidingWrapper from "@/components/KeyboardAvoidingWrapper";
import { baseAPIUrl } from "@/components/shared";
import { resetLoginScreen } from "@/utils/resetLoginScreen";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

const Security = ({ route, navigation }) => {
  StatusBar.setHidden(true);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("FAILED");

  // Handle messages
  const handleMessage = (message, type = "FAILED") => {
    setMessage(message);
    setMessageType(type);
  };

  const [newEmail, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleChangeEmail = async () => {
    const url = `${baseAPIUrl}/users/changeEmail`;

    try {
      const response = await axios.post(url, {
        currentEmail: route.params.email,
        newEmail,
      });

      const { statusText, message } = response.data;

      if (statusText !== "SUCCESS") {
        handleMessage(message, "FAILED");
      } else {
        handleMessage("Your email has been successfully updated.", "SUCCESS");

        // After successful email change, navigate to the Login screen
        Alert.alert(
          "Please log in again",
          "Your email has been updated. Please log in with your new email.",
          [
            {
              text: "OK",
              onPress: () => {
                // Call resetLoginScreen to reset the navigation stack and go to Login
                resetLoginScreen(navigation);
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "An error occurred while updating your password."
      );
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert(
        "Error",
        "Please fill in both the current and new passwords."
      );
      return;
    }

    const url = `${baseAPIUrl}/users/changePassword`;

    try {
      const response = await axios.post(url, {
        email: route.params.email,
        oldPassword,
        newPassword,
      });

      const { statusText, message } = response.data;

      if (statusText !== "SUCCESS") {
        handleMessage(message, "FAILED");
        Alert.alert("Error", message);
      } else {
        handleMessage(
          "Your password has been successfully updated.",
          "SUCCESS"
        );

        // After successful password change, log the user out and ask to log in again
        Alert.alert(
          "Please log in again",
          "Your password has been updated. Please log in with your new password.",
          [
            {
              text: "OK",
              onPress: () => {
                // Call resetLoginScreen to reset the navigation stack and go to Login
                resetLoginScreen(navigation);
              },
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "An error occurred while updating your password."
      );
    }
  };

  return (
    <KeyboardAvoidingWrapper>
      <SecurityContainer>
        {/* Change Email */}
        <Section>
          <TitleRow>
            <Ionicons name="mail-outline" size={20} color="#6d28d9" />
            <SectionTitle>Change Email</SectionTitle>
          </TitleRow>
          <SectionNote>Note: Use only lower case.</SectionNote>
          <Input
            placeholder="New Email"
            keyboardType="email-address"
            value={newEmail}
            onChangeText={setEmail}
          />
          <Button onPress={handleChangeEmail}>
            <ButtonText>Update Email</ButtonText>
          </Button>
        </Section>

        {/* Change Password */}
        <Section>
          <TitleRow>
            <Ionicons name="lock-closed-outline" size={20} color="#6d28d9" />
            <SectionTitle>Change Password</SectionTitle>
          </TitleRow>
          <SectionNote>
            Note: Password must be at least 8 characters.
          </SectionNote>
          <Input
            placeholder="Current Password"
            secureTextEntry
            value={oldPassword}
            onChangeText={setOldPassword}
          />
          <Input
            placeholder="New Password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <Button onPress={handleChangePassword}>
            <ButtonText>Update Password</ButtonText>
          </Button>
        </Section>
      </SecurityContainer>
    </KeyboardAvoidingWrapper>
  );
};

export default Security;
