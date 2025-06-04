import Constants from "expo-constants";
import { Dimensions } from "react-native";
import styled from "styled-components";

const StatusBarHeight = Constants.statusBarHeight;

const screenWidth = Dimensions.get("window").width;

/* colors */
export const Colors = {
  primary: "#ffffff",
  secondary: "#E5E7EB",
  tertiary: "#1F2937",
  darkLight: "#9CA3AF",
  brand: "#6D28D9",
  green: "#10B981",
  red: "#EF4444",
  gray: "#6B7280",
  lightGreen: "rgba(16, 185, 129, 0.1)",
};

const { primary, secondary, tertiary, darkLight, brand, green, red } = Colors;

export const StyledContainer = styled.View`
  flex: 1;
  padding: 25px;
  padding-top: ${StatusBarHeight + 30}px;
  background-color: ${primary};
`;

export const InnerContainer = styled.View`
  flex: 1;
  width: 100%;
  align-items: center;
`;

export const WelcomeContainer = styled(InnerContainer)`
  padding: 25px;
  padding-top: 10px;
  justify-content: center;
`;

export const PageLogo = styled.Image`
  width: 200px;
  height: 200px;
  border-radius: 100px;
`;

export const Avatar = styled.Image`
  width: 100px;
  height: 100px;
  margin: auto;
  border-radius: 50px;
  border-width: 2px;
  border-color: ${secondary};
  margin-bottom: 10px;
  margin-top: 10px;
`;

export const WelcomeImage = styled.Image`
  height: 50%;
  min-width: 100%;
`;

export const PageTitle = styled.Text`
  font-size: 30px;
  text-align: center;
  font-weight: bold;
  color: ${brand};
  padding-bottom: 5px;

  ${(props) =>
    props.welcome &&
    `
  font-size: 35px;
  `}
`;

export const SubTitle = styled.Text`
  font-size: 18px;
  margin-bottom: 30px;
  letter-spacing: 1px;
  font-weight: bold;
  color: ${tertiary};

  ${(props) =>
    props.welcome &&
    `
  margin-bottom: 5px;
  font-weight: normal;
  `}
`;

export const StyledFormArea = styled.View`
  width: 90%;
`;

export const StyledTextInput = styled.TextInput`
  background-color: ${secondary};
  padding: 15px;
  padding-left: 55px;
  padding-right: 55px;
  border-radius: 5px;
  font-size: 16px;
  height: 60px;
  margin-vertical: 3px;
  margin-bottom: 10px;
  color: ${tertiary};
`;

export const StyledInputLabel = styled.Text`
  color: ${tertiary};
  font-size: 13px;
  text-align: left;
`;

export const LeftIcon = styled.View`
  left: 15px;
  top: 38px;
  position: absolute;
  z-index: 1;
`;

export const RightIcon = styled.TouchableOpacity`
  right: 15px;
  top: 38px;
  position: absolute;
  z-index: 1;
`;

export const StyledButton = styled.TouchableOpacity`
  padding: 15px;
  background-color: ${brand};
  justify-content: center;
  align-items: center;
  border-radius: 5px;
  margin-vertical: 5px;
  height: 60px;

  ${(props) =>
    props.google == true &&
    `
    background-color: ${green};
    flex-direction: row;
    justify-content: center;
    `}
`;

export const ButtonText = styled.Text`
  color: ${primary};
  font-size: 16px;

  ${(props) =>
    props.google == true &&
    `
    margin-right: 10px;
    `}
`;

export const MsgBox = styled.Text`
  text-align: center;
  font-size: 13px;
  color: ${(props) => (props.type === "SUCCESS" ? "green" : "red")};
`;

export const Line = styled.View`
  height: 1px;
  width: 100%;
  background-color: ${darkLight};
  margin-vertical: 10px;
`;

export const ExtraView = styled.View`
  justify-content: center;
  flex-direction: row;
  align-items: center;
  padding: 10px;
`;

export const ExtraText = styled.Text`
  justify-content: center;
  align-content: center;
  color: ${tertiary};
  font-size: 15px;
`;

export const TextLink = styled.TouchableOpacity`
  justify-content: center;
  align-items: center;
`;

export const TextLinkContent = styled.Text`
  color: ${brand};
  font-size: 15px;

  ${(props) => {
    const { resendStatus } = props;
    if (resendStatus === "Failed!") {
      return `color: ${Colors.red}`;
    } else if (resendStatus === "Sent!") {
      return `color: ${Colors.green}`;
    }
  }}
`;

/* verification page components */
export const TopHalf = styled.View`
  flex: 1;
  justify-content: center;
  padding: 20px;
`;

export const IconBg = styled.View`
  width: 250px;
  height: 250px;
  background-color: ${Colors.lightGreen};
  border-radius: 250px;
  justify-content: center;
  align-items: center;
`;

export const BottomHalf = styled(TopHalf)`
  justify-content: space-around;
`;

export const InfoText = styled.Text`
  color: ${Colors.gray};
  font-size: 15px;
  text-align: center;
`;

export const EmphasizeText = styled.Text`
  font-weight: bold;
  font-style: italic;
`;

export const InlineGroup = styled.View`
  flex-direction: row;
  padding: 10px;
  justify-content: center;
  align-items: center;
`;

/* HomeTabs screen designs */

/* nothing yet */

/* end of HomeTabs screen designs */

/* Home screen designs */
export const HomeContainer = styled.ScrollView`
  flex: 1;
  background-color: #f9f9f9;
  padding: 20px;
`;

export const Header = styled.View`
  margin-bottom: 20px;
`;

export const WelcomeText = styled.Text`
  font-size: 24px;
  font-weight: 400;
  color: #333;
`;

export const StatCardsContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 20px;
`;

export const StatCard = styled.View`
  flex: 1;
  background-color: #6d28d9;
  margin-right: 10px;
  padding: 15px;
  border-radius: 12px;
`;

export const StatText = styled.Text`
  color: white;
  font-size: 18px;
  font-weight: bold;
`;

export const ChartContainer = styled.View`
  background-color: white;
  border-radius: 12px;
  padding: 15px;
  margin-bottom: 20px;
`;

export const HomeSectionTitle = styled.Text`
  font-size: 18px;
  font-weight: 600;
  color: #6d28d9;
  margin-bottom: 10px;
`;

export const CTAButtonsContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 80px;
`;

export const CTAButton = styled.TouchableOpacity`
  background-color: #6d28d9;
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  margin-right: 10px;
`;

export const CTAButtonText = styled.Text`
  color: white;
  text-align: center;
  font-weight: bold;
`;

/* end of home screen designs */

/* Trips screen designs */
export const RadioContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-top: 10px;
`;

export const RadioButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-right: 20px;
`;

export const RadioCircle = styled.View`
  height: 20px;
  width: 20px;
  border-radius: 10px;
  border-width: 2px;
  border-color: #6d28d9;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
`;

export const RadioText = styled.Text`
  font-size: 16px;
  color: #333;
`;

export const OptionsContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
`;

export const Container = styled.View`
  flex: 1;
  background-color: #f3f4f6;
  padding: 10px;
`;

export const StyledScrollView = styled.ScrollView`
  flex: 1;
  background-color: #f3f4f6;
  padding: 10px;
`;

export const OptionButton = styled.TouchableOpacity`
  padding-vertical: 8px;
  padding-horizontal: 12px;
  border-radius: 20px;
  border-width: 1px;
  border-color: #ccc;
  margin-right: 10px;
  margin-bottom: 10px;
`;

export const OptionText = styled.Text`
  color: #333;
`;

export const SearchContainer = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: #fff;
  border-radius: 25px;
  padding: 10px;
  margin-bottom: 20px;
  margin-top: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

export const SearchInput = styled.TextInput`
  flex: 1;
  height: 40px;
  font-size: 16px;
  padding-left: 10px;
  color: #333;
`;

export const SearchIcon = styled.View`
  padding-left: 10px;
`;

export const FiltersContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 10px;
  padding: 10px;
`;

export const Filter = styled.View`
  width: 48%;
  margin-bottom: 10px;
`;

export const FilterLabel = styled.Text`
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
`;

export const FilterInput = styled.TextInput`
  height: 40px;
  padding-left: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  margin-top: 5px;
  background-color: #fff;
`;

export const TripsContainer = styled.ScrollView`
  margin-bottom: 0px;
`;

export const TripCard = styled.View`
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  width: ${screenWidth - 40}px;
  align-self: center;
`;

export const CardImage = styled.Image`
  width: 100%;
  height: 300px;
  border-radius: 8px;
  margin-bottom: 10px;
`;

export const TripDescription = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
`;

export const TripsCTAButton = styled.TouchableOpacity`
  background-color: #6d28d9;
  padding: 10px;
  border-radius: 5px;
  align-items: center;
  margin-top: 10px;
`;

export const NoTripsText = styled.Text`
  font-size: 18px;
  color: #aaa;
  text-align: center;
`;

export const CreateTripContainer = styled.View`
  margin-top: 20px;
  align-items: center;
`;

export const TripDriverNote = styled.Text`
  font-size: 14px;
  color: ${Colors.gray};
  padding: 5px 20px 10px 20px;
`;
/* end of trips screenDesign */

/* TripHistory screen designs */
export const SectionTitleTH = styled.Text`
  font-size: 20px;
  font-weight: bold;
  margin-top: 20px;
  color: #333;
  align-self: center;
`;

export const Card = styled.View`
  flex-direction: row;
  background-color: #fff;
  margin-bottom: 15px;
  border-radius: 10px;
  overflow: hidden;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 5px;
  elevation: 3;
`;

export const ImageTh = styled.Image`
  width: 150px;
  height: 150px;
  resize-mode: contain;
`;

export const DetailsContainer = styled.View`
  flex: 1;
  padding: 12px;
  justify-content: center;
`;

export const TitleTh = styled.Text`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 5px;
`;

export const MetaTh = styled.Text`
  font-size: 14px;
  color: #666;
  margin-top: 2px;
  font-weight: 500;
`;

export const EmptyTextTh = styled.Text`
  color: #888;
  font-style: italic;
  margin-bottom: 10px;
  text-align: center;
`;

/* end of TripHistory screen designs */

/* Trip creation screen designs */
export const CreateScreenTripContainer = styled.ScrollView`
  flex: 1;
  padding: 20px;
  background-color: #ffffff;
`;

export const CarInputContainer = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px; /* optional spacing between columns */
`;

export const CarInputColumn = styled.View`
  width: 48%; /* Two columns with a small gap */
  margin-bottom: 12px;
`;

// Input Wrapper
export const InputGroup = styled.View`
  margin-bottom: 16px;
`;

// Label Text
export const Label = styled.Text`
  font-size: 14px;
  color: #374151;
  margin-bottom: 6px;
`;

// Input Field
export const StyledInput = styled.TextInput`
  border-width: 1px;
  border-color: #d1d5db;
  border-radius: 10px;
  padding: 12px;
  font-size: 14px;
  color: #111827;
`;

export const LabelRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
`;

export const SuggestButton = styled.TouchableOpacity`
  padding: 4px 8px;
  background-color: #e5e7eb;
  border-radius: 6px;
`;

export const SuggestButtonText = styled.Text`
  font-size: 12px;
  color: #2563eb;
  font-weight: 500;
`;

// Button
// export const TripsCTAButton = styled.TouchableOpacity`
//   background-color: #6d28d9;
//   padding: 14px;
//   border-radius: 10px;
//   align-items: center;
//   margin-top: 20px;
// `;
/* end of trip creation screen designs */

/* TripDetails screen designs */
export const TripDetailsContainer = styled.ScrollView`
  padding: 16px;
  background-color: #f3f4f6;
`;

export const TripTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 12px;
  align-self: center;
`;

export const TripDetailsDescription = styled.Text`
  font-size: 16px;
  margin-bottom: 16px;
  margin-left: 5px;
  color: #374151;
`;

import { Ionicons } from "@expo/vector-icons";

export const TripLocationAndPriceContainer = styled.View`
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  padding-horizontal: 10px;
  margin-top: 10px;
  margin-bottom: 20px;
`;

export const LocationContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const PriceContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const LocationText = styled.Text`
  margin-left: 5px;
  font-size: 16px;
  font-weight: semi-bold;
  color: #374151;
`;

export const RedText = styled.Text`
  color: red;
  font-size: 16px;
  font-weight: bold;
`;

export const PriceText = styled.Text`
  margin-left: 5px;
  font-size: 14px;
  font-weight: bold;
  color: #374151;
`;

export const PriceIcon = styled(Ionicons)`
  color: #6d28d9;
`;

export const LocationIcon = styled(Ionicons)`
  color: #6d28d9;
`;

export const TripPrice = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
`;

export const TripContainer = styled.View`
  background-color: lightgray;
  border-radius: 12px;
`;

export const TripAvailableSeats = styled.Text`
  padding-vertical: 14px;
  padding-horizontal: 16px;
  justify-content: "flex-start";
  font-size: 16px;
`;

export const TripOwnerInfo = styled.View`
  margin-bottom: 16px;
`;

export const InfoBox = styled.View`
  background-color: lightgray;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
`;

// export const InfoBoxText = styled.Text`
//   font-size: 14px;
//   color: "#333";
// `;

export const BookTripButton = styled.TouchableOpacity`
  background-color: #6d28d9;
  padding: 15px;
  border-radius: 10px;
  margin-top: 20px;
  align-items: center;
`;

export const BookTripButtonText = styled.Text`
  color: white;
  font-size: 18px;
  font-weight: bold;
`;
/* end of TripDetails screen designs */

/* More component screen designs */
export const ContactRowStyle = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 12px;
`;

export const ContactTextStyle = styled.Text`
  color: #374151;
  font-size: 14px;
`;

export const MoreContainer = styled.View`
  flex: 1;
  background-color: #fff;
  padding-horizontal: 20px;
`;

export const ContactInfoContainer = styled.View`
  margin-top: 20px;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
`;

/* end of More component screen designs */

/* Profile scren designs */
export const ProfileRole = styled.Text`
  border: 0.2px;
  border-radius: 5px;
  /* border-color: gray; */
  background-color: ${secondary};

  padding: 10px;

  text-align: center;
  margin: 0px 3px 10px 0px;
`;

export const ProfileRoleButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  height: 50px;
  padding: 5px;
  border: 1px solid #000;
  border-radius: 5px;
  margin: 0px 10px 10px 3px;
  background-color: #e6f9ec;
`;

// Optional styled text if needed
export const ProfileRoleButtonText = styled.Text`
  margin-left: 5px;
  font-size: 16px;
`;

export const ProfileRoleAndRatingContainer = styled.View`
  display: flex;
  flex-direction: row;
  justify-content: center;
  margin-bottom: 10px;
`;

export const RoleColoredText = styled.Text`
  color: #6d28d9;
  font-weight: bold;
  font-size: 20px;
`;

export const ProfileContainer = styled.View`
  flex: 1;
  padding: 25px;
  background-color: ${primary};
`;

export const MenuSection = styled.View`
  margin-bottom: 50px;
`;

export const MenuItem = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 15px;
  background-color: ${secondary};
  border-radius: 10px;
  margin-bottom: 10px;
`;

export const MenuText = styled.Text`
  font-size: 16px;
  margin-left: 10px;
`;

export const ProfileSection = styled.View`
  align-items: center;
  margin: 5px 10px 30px 10px;
`;

export const AvatarProfile = styled.Image`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  margin-bottom: 15px;
`;

export const ProfileName = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${tertiary};
`;

export const ProfileEmail = styled.Text`
  font-size: 14px;
  color: ${darkLight};
`;
/* end of profile screen designs */

/* Security screen designs */
// Container for Security screen
export const SecurityContainer = styled.ScrollView.attrs({
  contentContainerStyle: {
    flex: 1,
    padding: 20,
    paddingTop: 90,
    backgroundColor: "#f9f9f9",
    alignSelf: "center",
    justifyContent: "center",
    flexDirection: "column",
    width: "100%",
  },
})``;

// Section block (for Change Email, Change Password, etc.)
export const Section = styled.View`
  margin-bottom: 30px;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 10px;
  shadow-color: #000;
  shadow-opacity: 0.05;
  shadow-radius: 4px;
  elevation: 2;
`;

export const TitleRow = styled.View`
  flex-direction: row;
  align-items: center;
`;

// Section title
export const SectionTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
  color: #333;
  margin-left: 8px;
`;

export const SectionNote = styled.Text`
  font-size: 12px;
  margin-bottom: 15px;
  color: ${Colors.gray};
`;

// Input field
export const Input = styled.TextInput`
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 10px;
  font-size: 16px;
  margin-bottom: 10px;
  background-color: #fdfdfd;
`;

// Button and its text
export const Button = styled.TouchableOpacity`
  background-color: #6d28d9;
  padding: 12px;
  border-radius: 8px;
  align-items: center;
  margin-top: 10px;
`;

// export const ButtonText = styled.Text`
//   color: white;
//   font-size: 16px;
//   font-weight: bold;
// `;
/* end of security screen designs */

/* AboutVehicle screen designs */
export const VehicleContainer = styled.View`
  margin-top: 80px;
  padding: 20px;
  background-color: ${primary};
`;

export const VehicleCard = styled.View`
  background-color: ${secondary};
  padding: 20px;
  border-radius: 15px;
  width: 100%;
  align-items: center;
  shadow-color: #000;
  shadow-opacity: 0.1;
  shadow-radius: 5px;
  elevation: 3;
  margin-top: 10px;
`;

export const VehicleImage = styled.Image`
  width: 100%;
  height: 180px;
  border-radius: 10px;
  margin-bottom: 5px;
`;

export const VehicleTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
  color: ${tertiary};
`;

export const VehicleRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 12px;
`;

export const VehicleLabel = styled.Text`
  font-weight: 600;
  color: ${darkLight};
`;

export const VehicleValue = styled.Text`
  font-weight: 500;
  color: ${tertiary};
`;
/* end of about vehicle screen designs */

/* CustomHeader container */
export const HeaderContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 10px;
`;

/* Profile image */
export const ProfileImage = styled.Image`
  width: 35px;
  height: 35px;
  border-radius: 18px;
  margin-right: 10px;
`;

/* Name and email text */
export const NameText = styled.Text`
  font-size: 14px;
  font-weight: bold;
`;

export const EmailText = styled.Text`
  font-size: 12px;
  color: gray;
`;

// Add this along with other styled components
export const TextGroup = styled.View`
  flex-direction: column;
`;

export const MoreScreenSpacer = styled.View`
  height: 40px;
`;
