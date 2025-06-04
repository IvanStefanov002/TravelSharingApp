import Constants from "expo-constants";

const debuggerHost =
  Constants.manifest?.debuggerHost || Constants.expoConfig?.hostUri;
const ip = debuggerHost?.split(":")[0];
export const baseAPIUrl = `http://${ip}:3000`;

/* More::Help&FAQ */
export const helpFaqText =
  "Q: How do I book a trip?\nA: Browse available trips in the “Explore Trips” tab and tap on a trip to view details and reserve a seat.\n\nQ: Can I cancel a trip?\nA: You can cancel a booking up to 24 hours before the departure time. Visit the “My Trips” section to manage your reservations.\n\nQ: Is it safe to share rides with others?\nA: All drivers and passengers are required to register and verify their identity. Please also check driver ratings before booking.\n\nQ: What if I have an issue during a trip?\nA: You can contact us directly via the “Contact Support” section at the bottom of the “More” tab.";

/* More::Privacy Policy */
export const privacyPolicyText =
  "Your privacy is important to us. We collect only the data necessary to provide and improve our ride-sharing service. This includes contact details, trip information, and app usage analytics.\n\n- We never sell or share your data with third parties without your consent.\n- You may request to delete your data at any time by contacting support.\n- All personal information is stored securely and encrypted.\n\nBy using the app, you agree to our privacy policy.";

/* More::About the app */
export const aboutAppText =
  "TravelSharingApp is a community-powered ride-sharing platform that helps drivers and passengers connect for safer, more affordable travel across Bulgaria.\n\n- Built for commuters, students, and casual travelers\n- Focused on safety, affordability, and user experience\n- Developed with love and purpose to reduce travel costs and carbon footprint\n\nWe're constantly improving the app — thank you for being part of our journey!";

/* More::Customer support */
export const ownerMsisdn = "+359 89 240 0139";
export const ownerEmail = "support@travelsharingapp.com";
export const ownerWebsite = "www.travelsharingapp.com";

export const GoogleAPIKey = "AIzaSyAIyR9SaxIbHvT_nBgcE2KeZY_0CwJXc8c";
