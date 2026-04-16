import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSelector } from "react-redux";
import Colors from "../../constants/Colors";
import { selectCurrentUser } from "../../store/slices/authSlice";

export default function UpgradeButton() {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={() => router.push("/plans")}>
      <LinearGradient
        colors={["#0044E0", "#F20165"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.creditsBadge}
      >
        <FontAwesome5
          name="database"
          size={11}
          color={"#FFCD0F"}
        />
        <Text style={styles.badgeText}>{user?.credits ?? 0}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  creditsBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 20,
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    color: Colors.dark.white,
    // fontWeight: "800",
    fontSize: 10,
    letterSpacing: 0.5,
    marginLeft: 5,
    lineHeight: 18,
  },
});
