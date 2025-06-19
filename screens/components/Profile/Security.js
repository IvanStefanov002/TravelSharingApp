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
    if (!newEmail) {
      Alert.alert("Грешка!", "Моля, въведете нов имейл адрес.");
      return;
    }

    if (route.params.email?.toLowerCase() === newEmail?.toLowerCase()) {
      Alert.alert("Грешка!", "Текущият и новият имейл адрес съвпадат!");
      return;
    }

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
        handleMessage("Имейл адресът беше успешно променен.", "SUCCESS");

        // After successful email change, navigate to the Login screen
        Alert.alert(
          "Моля впишете се отново!",
          "Вашият имейл беше актуализиран. Моля, влезте с новия имейл.",
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
        "Грешка",
        error.response?.data?.message ||
          "Възникна грешка при актуализирането на паролата ви."
      );
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert(
        "Грешка",
        "Моля, въведете както настоящата, така и новата парола."
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
        Alert.alert("Грешка", message);
      } else {
        handleMessage(
          "Your password has been successfully updated.",
          "SUCCESS"
        );

        // After successful password change, log the user out and ask to log in again
        Alert.alert("Моля впишете се отново", "Вашата парола беше обновена!", [
          {
            text: "OK",
            onPress: () => {
              // Call resetLoginScreen to reset the navigation stack and go to Login
              resetLoginScreen(navigation);
            },
          },
        ]);
      }
    } catch (error) {
      Alert.alert(
        "Грешка",
        error.response?.data?.message ||
          "Появи се грешка докато се обновяваше паролата!."
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
            <SectionTitle>Смяна на имейл адрес</SectionTitle>
          </TitleRow>
          <SectionNote>Забележка: Използвайте само малки букви.</SectionNote>
          <Input
            placeholder="Нов имейл адрес"
            keyboardType="email-address"
            value={newEmail}
            onChangeText={setEmail}
          />
          <Button onPress={handleChangeEmail}>
            <ButtonText>Промени имейл адрес</ButtonText>
          </Button>
        </Section>

        {/* Change Password */}
        <Section>
          <TitleRow>
            <Ionicons name="lock-closed-outline" size={20} color="#6d28d9" />
            <SectionTitle>Смяна на парола</SectionTitle>
          </TitleRow>
          <SectionNote>
            Забележка: Паролата трябва да е поне 8 символа.
          </SectionNote>
          <Input
            placeholder="Настояща парола"
            secureTextEntry
            value={oldPassword}
            onChangeText={setOldPassword}
          />
          <Input
            placeholder="Нова парола"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <Button onPress={handleChangePassword}>
            <ButtonText>Промени паролата</ButtonText>
          </Button>
        </Section>
      </SecurityContainer>
    </KeyboardAvoidingWrapper>
  );
};

export default Security;
