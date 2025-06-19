import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, View } from "react-native";

/* api url */
import { baseAPIUrl } from "../components/shared";

/* formik */
import { Formik } from "formik";

/* icons */
import { Ionicons, Octicons } from "@expo/vector-icons";

/* styling components */
import {
  ButtonText,
  Colors,
  ExtraText,
  ExtraView,
  InnerContainer,
  LeftIcon,
  Line,
  MsgBox,
  PageLogo,
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

/* utils */
const { brand, darkLight, primary } = Colors;

/* keyboard avoiding wrapper */
import KeyboardAvoidingWrapper from "./../components/KeyboardAvoidingWrapper";

/* API client */
import axios from "axios";

/* JWT */
import AsyncStorage from "@react-native-async-storage/async-storage";

/* Google Auth */
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";

/* client ids */
import { fetchClientIds } from "./../utils/fetchClientIds";

const logoutFromGoogle = async (accessToken) => {
  try {
    await AuthSession.revokeAsync(
      { token: accessToken },
      { revocationEndpoint: "https://oauth2.googleapis.com/revoke" }
    );
    console.log("Logged out from Google");
  } catch (err) {
    console.error("Logout failed:", err);
  }
};

WebBrowser.maybeCompleteAuthSession();

const Login = ({ navigation, route }) => {
  /* google sign in credentials */
  const [androidClientId, setAndroidClientId] = useState("");
  const [iosClientId, setIosClientId] = useState("");
  const [webClientId, setWebClientId] = useState("");

  const [hidePassword, setHidePassword] = useState(true);
  const [message, setMessage] = useState();
  const [messageType, setMessageType] = useState();
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [accessToken, setAccessToken] = useState(null);

  /* UseEffect to fetch Google API key */
  useEffect(() => {
    const getClientIds = async () => {
      const response = await fetchClientIds();
      if (response) {
        setAndroidClientId(response.android_client_id);
        setIosClientId(response.ios_client_id);
        setWebClientId(response.web_client_id);
      }
    };

    getClientIds();
  }, []);

  /*
  Rules for all authentication providers:
  Expo Go cannot be used for local development and testing of OAuth or OpenID Connect-enabled apps due 
  to the inability to customize your app scheme. You can instead use a Development Build, which enables 
  an Expo Go-like development experience and supports OAuth redirects back to your app after login in 
  a manner that works just like it would in production.
  */
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: androidClientId,
    iosClientId: iosClientId,
    webClientId: webClientId,
    scopes: ["profile", "email"],
    prompt: "select_account",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      fetchUserInfo(authentication.accessToken);
    }
  }, [response]);

  const fetchUserInfo = async (token) => {
    try {
      const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const user = await res.json();

      /* Save token in state for future logout */
      setAccessToken(token);

      //navigation.navigate("HomeTabs", { ...user });
    } catch (error) {
      handleMessage("Failed to get Google user info");
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const handleLogin = async (credentials, setSubmitting) => {
    const url = `${baseAPIUrl}/users/login`;

    try {
      const response = await axios.post(url, credentials);
      const { statusText, message, token, data } = response.data;

      if (statusText !== "SUCCESS") {
        handleMessage(message, "FAILED");
      } else {
        handleMessage("Успешно вписване!", "SUCCESS");

        /* Save token to AsyncStorage */
        await AsyncStorage.setItem("token", token);

        /* Navigate to home screen */
        navigation.navigate("HomeTabs", { ...data[0] });
      }
    } catch (error) {
      console.error("Login error:", error);
      setSubmitting(false);

      if (error.response?.status !== 200) {
        handleMessage(error.response?.data?.message || "Неуспешно вписване");
      } else {
        handleMessage("Проблем с мрежата. Опитай отново.", "FAILED");
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
        <StatusBar style="light" hidden={true} />
        <InnerContainer>
          <PageLogo
            resizeMode="cover"
            source={require("./../assets/images/logoNew.png")}
          />
          <PageTitle>TravelBuddy</PageTitle>
          <SubTitle>Вход в акаунта</SubTitle>

          <Formik
            initialValues={{ email: route?.params?.email, password: "" }}
            enableReinitialize={true}
            onSubmit={(values, { setSubmitting }) => {
              if (values.email === "" || values.password === "") {
                handleMessage("Моля попълни всички полета!");
                setSubmitting(false);
              } else {
                handleLogin(values, setSubmitting);
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
                  label="Имейл адрес"
                  icon="mail"
                  placeholder="example@gmail.com"
                  placeholderTextColor={darkLight}
                  onChangeText={handleChange("email")}
                  onBlur={handleBlur("email")}
                  value={values.email}
                  keyboardType="email-address"
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
                <MsgBox type={messageType}>{message}</MsgBox>

                {!isSubmitting ? (
                  <StyledButton onPress={handleSubmit}>
                    <ButtonText>Вход</ButtonText>
                  </StyledButton>
                ) : (
                  <StyledButton disabled={true}>
                    <ActivityIndicator size="large" color={primary} />
                  </StyledButton>
                )}

                <Line />

                {!googleSubmitting ? (
                  <StyledButton
                    google={true}
                    onPress={async () => {
                      setGoogleSubmitting(true);
                      try {
                        if (accessToken) {
                          await AuthSession.revokeAsync(
                            { token: accessToken },
                            {
                              revocationEndpoint:
                                "https://oauth2.googleapis.com/revoke",
                            }
                          );
                        }
                      } catch (err) {
                        console.warn(
                          "Logout failed or no token to revoke:",
                          err
                        );
                      } finally {
                        promptAsync(); /* continue login */
                      }
                    }}
                  >
                    <Image
                      source={require("./../assets/images/google-logo.png")}
                      style={{ width: 40, height: 40 }}
                    />
                    <ButtonText google={true}>
                      Вход чрез Google акаунт
                    </ButtonText>
                  </StyledButton>
                ) : (
                  <StyledButton google={true} disabled={true}>
                    <ActivityIndicator size="large" color={primary} />
                  </StyledButton>
                )}

                <ExtraView>
                  <ExtraText>Все още нямаш регистрация? </ExtraText>
                  <TextLink onPress={() => navigation.navigate("Signup")}>
                    <TextLinkContent>Регистрация</TextLinkContent>
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
  ...props
}) => (
  <View>
    <LeftIcon>
      <Octicons name={icon} size={30} color={brand} />
    </LeftIcon>
    <StyledInputLabel>{label}</StyledInputLabel>
    <StyledTextInput {...props} />
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

export default Login;
