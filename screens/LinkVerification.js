import {
  BottomHalf,
  ButtonText,
  Colors,
  EmphasizeText,
  IconBg,
  InfoText,
  PageTitle,
  StyledButton,
  StyledContainer,
  TopHalf,
} from "@/components/styles";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";

import { Ionicons, Octicons } from "@expo/vector-icons";

import ResendTimer from "./../components/ResendTimer";

/* api client */
import axios from "axios";

/* api route */
import { baseAPIUrl } from "../components/shared";

const { brand, primary, green } = Colors;

const Verification = ({ navigation, route }) => {
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendStatus, setResendStatus] = useState("Resend");

  /* resend timer */
  const [timeLeft, setTimeLeft] = useState(null);
  const [targetTime, setTargetTime] = useState(null);

  const [activeResend, setActiveResend] = useState(false);
  let resendTimerInterval;

  const { email, userId } = route?.params;

  const calculateTimeLeft = (finalTime) => {
    const difference =
      finalTime - +new Date(); /* + converts the Date value to integer */
    if (difference >= 0) {
      setTimeLeft(Math.round(difference / 1000));
    } else {
      setTimeLeft(null);
      clearInterval(resendTimerInterval);
      setActiveResend(true);
    }
  };

  useEffect(() => {
    triggerTimer();

    return () => {
      clearInterval(resendTimerInterval);
    };
  }, []);

  const resendEmail = async () => {
    setResendingEmail(true); /* turn the button into activity indicator */

    /* make request */
    const url = `${baseAPIUrl}/users/resendVerificationLink`;

    try {
      await axios.post(url, { email, userId });
      setResendStatus("Sent!");
    } catch (error) {
      setResendStatus("Failed!");
      alert(`Resending email failed! ${error.message}`);
    }
    setResendingEmail(false);

    /* hold on message */
    setTimeout(() => {
      setResendStatus("Resend");
      setActiveResend(false);
      triggerTimer();
    }, 5000);
  };

  const triggerTimer = (targetTimeInSeconds = 30) => {
    setTargetTime(targetTimeInSeconds);
    setActiveResend(false);
    const finalTime = +new Date() + targetTimeInSeconds * 1000;
    resendTimerInterval = setInterval(
      () => (calculateTimeLeft(finalTime), 1000)
    );
  };

  return (
    <StyledContainer
      style={{
        alignItems: "center",
      }}
    >
      <TopHalf>
        <IconBg>
          <StatusBar style="dark" />
          <Octicons name="mail" size={125} color={brand} />
        </IconBg>
      </TopHalf>
      <BottomHalf>
        <PageTitle style={{ fontSize: 25 }}>Валидиране на акаунт</PageTitle>
        <InfoText>
          Моля, потвърдете имейла си чрез връзката, изпратена на
          <EmphasizeText>{` ${email}`}</EmphasizeText>
        </InfoText>

        <StyledButton
          onPress={() => navigation.navigate("Login", { email: email })}
          style={{ backgroundColor: green, flexDirection: "row" }}
        >
          <ButtonText>Продължи </ButtonText>
          <Ionicons name="arrow-forward-circle" size={25} color={primary} />
        </StyledButton>
        <ResendTimer
          activeResend={activeResend}
          resendingEmail={resendingEmail}
          resendStatus={resendStatus}
          timeLeft={timeLeft}
          targetTime={targetTime}
          resendEmail={resendEmail}
        />
      </BottomHalf>
    </StyledContainer>
  );
};

export default Verification;
