import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "../../constants/Colors";
import AppLogo from "./AppLogo";

export const OnboardingHeader = () => {
  return (
    <View style={styles.header}>
      <AppLogo containerStyle={{ marginBottom: 40 }} />
      <Text style={styles.title}>Welcome to</Text>
      <Text style={styles.title}>Clipzo</Text>
      <Text style={styles.subtitle}>
        Create stunning videos, animate old photos, and bring your memories to
        life.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "600",
    color: Colors.dark.text,
    textAlign: "center",
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.dark.textMuted,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 10,
    marginTop: 10,
  },
});
