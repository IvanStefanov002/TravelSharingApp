import { StatusBar } from "expo-status-bar";

import { resetLoginScreen } from "./../utils/resetLoginScreen";

import { baseAPIUrl } from "../components/shared";
import {
  Avatar,
  ButtonText,
  InnerContainer,
  Line,
  PageTitle,
  StyledButton,
  StyledFormArea,
  SubTitle,
  WelcomeContainer,
  WelcomeImage,
} from "./../components/styles";

const Welcome = ({ navigation, route }) => {
  const { name, email, photoUrl } = route.params;
  const AvatarImg = photoUrl
    ? { uri: `${baseAPIUrl}${photoUrl}` }
    : require("./../assets/images/logo.png");

  return (
    <>
      <StatusBar style="light" />
      <InnerContainer>
        <WelcomeImage resizeMode="cover" source={AvatarImg} />
        <WelcomeContainer>
          <PageTitle welcome={true}>Welcome, Buddy!</PageTitle>
          <SubTitle welcome={true}>{name || "Unable to load"}</SubTitle>
          <SubTitle welcome={true}>{email || "Unable to load"}</SubTitle>
          <StyledFormArea>
            <Avatar
              resizeMode="cover"
              source={require("./../assets/images/travelBuddy.png")}
            />
            <Line />
            <StyledButton onPress={() => resetLoginScreen(navigation)}>
              <ButtonText>Logout</ButtonText>
            </StyledButton>
          </StyledFormArea>
        </WelcomeContainer>
      </InnerContainer>
    </>
  );
};

export default Welcome;

/*
onPress={() => {
                nav
                navigation.navigate('Login');
              }}
                */
