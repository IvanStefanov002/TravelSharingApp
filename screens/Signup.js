/* for local host ip */

import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";

/* formik */
import { Formik } from "formik";

/* icons */
import { Ionicons, Octicons } from "@expo/vector-icons";

/* api route */
import { baseAPIUrl } from "../components/shared";

/* back to login screen */
import { resetLoginScreen } from "./../utils/resetLoginScreen";

import {
  ButtonText,
  Colors,
  ExtraText,
  ExtraView,
  InnerContainer,
  LeftIcon,
  Line,
  MsgBox,
  PageTitle,
  RightIcon,
  StyledButton,
  StyledContainer,
  StyledFormArea,
  StyledInputLabel,
  StyledTextInput,
  SubTitle,
  TextLink,
  TextLinkContent,
} from "./../components/styles";

/* Colors */
const { brand, darkLight, primary } = Colors;

/* Keyboard Avoiding Wrapper */
import KeyboardAvoidingWrapper from "./../components/KeyboardAvoidingWrapper";

/* Datetimepicker */
import DateTimePicker from "@react-native-community/datetimepicker";

/* API client */
import axios from "axios";

const Signup = ({ navigation }) => {
  const [hidePassword, setHidePassword] = useState(true);
  const [show, setShow] = useState(false);
  const [date, setDate] = useState(new Date(2000, 0, 1));

  const [message, setMessage] = useState();
  const [messageType, setMessageType] = useState();

  /* Actual date of birth to be sent */
  const [dob, setDob] = useState();

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(false); /* hide datetimepicker */
    setDate(currentDate);
    setDob(currentDate);
  };

  const showDatePicker = () => {
    setShow(true);
  };

  const handleSignup = async (credentials, setSubmitting) => {
    const url = `${baseAPIUrl}/users/signup`;

    try {
      /* Make the POST request */
      const response = await axios.post(url, credentials);

      /* Handle the response data */
      const { statusText, message, data } = response.data;

      /* If the server's response status is not success, show the message */
      if (statusText !== "PENDING") {
        handleMessage(message, "FAILED");
      } else {
        /* Successful login, navigate to Verification page */
        handleMessage("Успешна регистрация!", "SUCCESS");
        navigation.navigate("Verification", { ...data });
      }
    } catch (error) {
      if (error.response) {
        /* here will go after error from server */
        console.log("Response error:", error.response.data);
        console.log("Response status:", error.response.status);
      } else if (error.request) {
        /* The request was made but no response was received */
        console.log("No response received:", error.request);
      } else {
        /* Something happened in setting up the request that triggered an error */
        console.log("Error message:", error.message);
      }

      /* Ensure form submission is marked as complete */
      setSubmitting(false);

      if (error.response.status !== 200) {
        handleMessage(error.response.data.message);
      } else {
        handleMessage("Проблем с мрежата, опитай по-късно!", "FAILED");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleMessage = (message, type = "FAILED") => {
    setMessage(message);
    setMessageType(type);
  };

  return (
    <KeyboardAvoidingWrapper>
      <StyledContainer>
        <StatusBar style="dark" />
        <InnerContainer>
          <PageTitle>TravelBuddy</PageTitle>
          <SubTitle>Създаване на акаунт</SubTitle>

          {show && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={onChange}
            />
          )}

          <Formik
            initialValues={{
              name: "",
              email: "",
              phone: "",
              dateOfBirth: "",
              password: "",
              confirmPassword: "",
            }}
            onSubmit={(values, { setSubmitting }) => {
              values = { ...values, dateOfBirth: dob };
              if (
                values.email == "" ||
                values.password == "" ||
                values.name == "" ||
                values.phone == "" ||
                values.dateOfBirth == "" ||
                values.confirmPassword == ""
              ) {
                handleMessage("Моля попълни всички полета!");
                setSubmitting(false);
              } else if (values.password !== values.confirmPassword) {
                handleMessage("Паролите не съвпадат!");
                setSubmitting(false);
              } else {
                handleSignup(values, setSubmitting);
              }
            }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              isSubmitting,
            }) => (
              <StyledFormArea>
                <MyTextInput
                  label="Имена"
                  icon="person"
                  placeholder="Ivan Ivanov"
                  placeholderTextColor={darkLight}
                  onChangeText={handleChange("name")}
                  onBlur={handleBlur("name")}
                  value={values.name}
                />

                <MyTextInput
                  label="Имейл адрес"
                  icon="mail"
                  placeholder="andyj@gmail.com"
                  placeholderTextColor={darkLight}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  value={values.email}
                  keyboardType="email-address"
                />

                <MyTextInput
                  label="Телефонен номер"
                  icon="device-mobile"
                  placeholder="0891234567"
                  placeholderTextColor={darkLight}
                  onChangeText={handleChange("phone")}
                  onBlur={handleBlur("phone")}
                  value={values.phone}
                  keyboardType="phone-pad"
                />

                <MyTextInput
                  label="Дата на раждане"
                  icon="calendar"
                  placeholder="YYYY - MM -- DD"
                  placeholderTextColor={darkLight}
                  onChangeText={handleChange("dateOfBirth")}
                  onBlur={handleBlur("dateOfBirth")}
                  value={dob ? dob.toDateString() : ""}
                  isDate={true}
                  editable={false}
                  showDatePicker={showDatePicker}
                />

                <MyTextInput
                  label="Парола"
                  icon="lock"
                  placeholder="* * * * * * * *"
                  placeholderTextColor={darkLight}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  value={values.password}
                  secureTextEntry={hidePassword}
                  isPassword={true}
                  hidePassword={hidePassword}
                  setHidePassword={setHidePassword}
                />

                <MyTextInput
                  label="Потвърди парола"
                  icon="lock"
                  placeholder="* * * * * * * *"
                  placeholderTextColor={darkLight}
                  onChangeText={handleChange("confirmPassword")}
                  onBlur={handleBlur("confirmPassword")}
                  value={values.confirmPassword}
                  secureTextEntry={hidePassword}
                  isPassword={true}
                  hidePassword={hidePassword}
                  setHidePassword={setHidePassword}
                />

                <MsgBox type={messageType}>{message}</MsgBox>

                {!isSubmitting && (
                  <StyledButton onPress={handleSubmit}>
                    <ButtonText>Регистрация</ButtonText>
                  </StyledButton>
                )}

                {isSubmitting && (
                  <StyledButton diabled={true}>
                    <ActivityIndicator size="large" color={primary} />
                  </StyledButton>
                )}

                <Line />
                <ExtraView>
                  <ExtraText>Вече имаш регистрация? </ExtraText>
                  <TextLink
                    onPress={() => {
                      resetLoginScreen(navigation);
                    }}
                  >
                    <TextLinkContent>Вписване</TextLinkContent>
                  </TextLink>
                </ExtraView>
              </StyledFormArea>
            )}
          </Formik>
        </InnerContainer>
      </StyledContainer>
    </KeyboardAvoidingWrapper>
  );
};

const MyTextInput = ({
  label,
  icon,
  isPassword,
  hidePassword,
  setHidePassword,
  isDate,
  showDatePicker,
  ...props
}) => {
  return (
    <View>
      <LeftIcon>
        <Octicons name={icon} size={30} color={brand} />
      </LeftIcon>
      <StyledInputLabel>{label}</StyledInputLabel>
      {!isDate && <StyledTextInput {...props} />}
      {isDate && (
        <TouchableOpacity onPress={showDatePicker}>
          <StyledTextInput {...props} />
        </TouchableOpacity>
      )}
      {isPassword && (
        <RightIcon onPress={() => setHidePassword(!hidePassword)}>
          <Ionicons
            name={hidePassword ? "eye-off" : "eye"}
            size={30}
            color={darkLight}
          />
        </RightIcon>
      )}
    </View>
  );
};

export default Signup;
