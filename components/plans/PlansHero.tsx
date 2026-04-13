import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "../../constants/Colors";

export const PlansHero = () => {
  return (
    <View style={styles.heroSection}>
      <Text style={styles.heroTitle}>Boost Your Creativity</Text>
      <Text style={styles.heroSubtitle}>
        Select a credit pack to generate more stunning AI videos
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  heroSection: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.dark.white,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.dark.icon,
    textAlign: "center",
    marginTop: 10,
  },
});
