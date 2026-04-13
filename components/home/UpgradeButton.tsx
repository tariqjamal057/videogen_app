import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import Colors from "../../constants/Colors";

export default function UpgradeButton() {
  const router = useRouter();
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/plans")}>
      <LinearGradient
        colors={Colors.dark.buttonGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.creditsBadge}
      >
        <MaterialIcons
          name="auto-awesome"
          size={10}
          color={Colors.dark.white}
        />
        <Text style={styles.badgeText}>Credits</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  creditsBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    color: Colors.dark.white,
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.5,
    marginLeft: 3,
    textTransform: "uppercase",
    lineHeight: 16,
  },
});
