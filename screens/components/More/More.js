import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  LayoutAnimation,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from "react-native";
import {
  ContactInfoContainer,
  ContactRowStyle,
  ContactTextStyle,
  MoreContainer,
} from "../../../components/styles";

import {
  aboutAppText,
  helpFaqText,
  ownerEmail,
  ownerMsisdn,
  ownerWebsite,
  privacyPolicyText,
} from "../../../components/shared";

// Enable LayoutAnimation on Android
if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function More() {
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection(expandedSection === section ? null : section);
  };

  const sections = [
    { id: "faq", title: "Help / FAQ", content: helpFaqText },
    { id: "privacy", title: "Privacy Policy", content: privacyPolicyText },
    { id: "about", title: "About the App", content: aboutAppText },
  ];

  return (
    <ScrollView>
      <MoreContainer style={{ padding: 16 }}>
        {sections.map((section) => (
          <View
            key={section.id}
            style={{
              marginBottom: 15,
              backgroundColor: "#f9fafb",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#e5e7eb",
              overflow: "hidden",
            }}
          >
            <TouchableOpacity
              onPress={() => toggleSection(section.id)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 14,
                paddingHorizontal: 16,
                backgroundColor: "#f3f4f6",
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "600", color: "#111827" }}
              >
                {section.title}
              </Text>
              <Ionicons
                name={
                  expandedSection === section.id
                    ? "chevron-up-outline"
                    : "chevron-down-outline"
                }
                size={20}
                color="#4b5563"
              />
            </TouchableOpacity>

            {expandedSection === section.id && (
              <View style={{ padding: 16, backgroundColor: "#ffffff" }}>
                <Text
                  style={{ color: "#374151", fontSize: 14, lineHeight: 20 }}
                >
                  {section.content}
                </Text>
              </View>
            )}
          </View>
        ))}

        <ContactInfoContainer style={{ marginTop: 32 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: "#111827",
              marginBottom: 16,
            }}
          >
            Customer Support
          </Text>

          <ContactRowStyle>
            <Ionicons
              name="call-outline"
              size={20}
              color="#4b5563"
              style={{ marginRight: 10 }}
            />
            <ContactTextStyle>{ownerMsisdn}</ContactTextStyle>
          </ContactRowStyle>

          <ContactRowStyle>
            <Ionicons
              name="mail-outline"
              size={20}
              color="#4b5563"
              style={{ marginRight: 10 }}
            />
            <ContactTextStyle>{ownerEmail}</ContactTextStyle>
          </ContactRowStyle>

          <ContactRowStyle>
            <Ionicons
              name="globe-outline"
              size={20}
              color="#4b5563"
              style={{ marginRight: 10 }}
            />
            <ContactTextStyle style={{ color: "#2563eb" }}>
              {ownerWebsite}
            </ContactTextStyle>
          </ContactRowStyle>
        </ContactInfoContainer>
      </MoreContainer>
    </ScrollView>
  );
}
