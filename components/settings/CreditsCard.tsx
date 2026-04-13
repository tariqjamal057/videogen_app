import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import Colors from "../../constants/Colors";
import { selectCurrentUser } from "../../store/slices/authSlice";

export default function CreditsCard() {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);

  if (!user) return null;

  const userCredits = user.credits;
  return (
    <View style={styles.creditsContainer}>
      <View style={styles.creditsDisplay}>
        <View>
          <Text style={styles.creditsLabel}>Current Balance</Text>
          <View style={styles.creditsValueRow}>
            <Text style={styles.creditsValue}>{userCredits}</Text>
            <Text style={styles.creditsUnit}>Credits</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.historyButton}
          activeOpacity={0.7}
          onPress={() => router.push("/purchase-history")}
        >
          <MaterialIcons name="history" size={20} color={Colors.dark.icon} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push("/plans")}
        style={styles.refillButtonWrapper}
      >
        <LinearGradient
          colors={Colors.dark.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.refillButton}
        >
          <MaterialIcons
            name="auto-awesome"
            size={20}
            color={Colors.dark.white}
          />
          <Text style={styles.refillButtonText}>GET CREDITS</Text>
          <View style={styles.refillHighlight}>
            <MaterialIcons
              name="chevron-right"
              size={20}
              color={Colors.dark.white}
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  creditsContainer: {
    marginTop: 16,
    backgroundColor: Colors.dark.whiteTranslucentVeryLow,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.whiteTranslucentLow,
    overflow: "hidden",
    width: "100%",
  },
  creditsDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: 16,
  },
  creditsLabel: {
    fontSize: 13,
    color: Colors.dark.icon,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  creditsValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 4,
  },
  creditsValue: {
    fontSize: 32,
    fontWeight: "800",
    color: Colors.dark.white,
  },
  creditsUnit: {
    fontSize: 14,
    color: Colors.dark.icon,
    marginLeft: 6,
    fontWeight: "500",
  },
  historyButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.dark.whiteTranslucentLow,
    alignItems: "center",
    justifyContent: "center",
  },
  refillButtonWrapper: {
    padding: 12,
    paddingTop: 0,
  },
  refillButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingVertical: 14,
    paddingLeft: 16,
    borderRadius: 12,
    position: "relative",
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  refillButtonText: {
    color: Colors.dark.white,
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 8,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  refillHighlight: {
    position: "absolute",
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.dark.whiteTranslucent,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.dark.whiteTranslucent,
  },
});
