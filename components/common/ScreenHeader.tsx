import { FontAwesome, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "../../constants/Colors";
import UpgradeButton from "../home/UpgradeButton";

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  renderRight?: () => React.ReactNode;
  showCredits?: boolean;
}

export function ScreenHeader({
  title,
  onBack,
  renderRight,
  showCredits = true,
}: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBack || (() => router.back())}
        activeOpacity={0.7}
        style={styles.backButtonContainer}
      >
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.4)", "rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.backButtonGradient}
        >
          <View style={styles.backButtonInner}>
            <FontAwesome5
              name="arrow-left"
              size={14}
              color={Colors.dark.white}
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.headerRight}>
        {renderRight ? (
          renderRight()
        ) : showCredits ? (
          <UpgradeButton  />
        ) : (
          <View style={styles.headerRightPlaceholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    height: 60,
    width: "100%",
  },
  backButtonContainer: {
    width: 35,
    height: 35,
    borderRadius: 44,
    marginLeft: -4,
    // borderWidth: 0.5,
    // borderColor: "rgba(255, 255, 255, 0.4)",
    // Shadows (approximated)
    shadowColor: "#000000",
    shadowOffset: { width: -1.86, height: -1.73 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
  backButtonGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 44,
    padding: 0.5, // Border width simulation
  },
  backButtonInner: {
    width: "100%",
    height: "100%",
    borderRadius: 44,
    backgroundColor: "#FFFFFF1A",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 0,
    paddingRight: 0,
    paddingBottom: 0,
    paddingLeft: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: "Molengo",
    fontWeight: "400",
    color: Colors.dark.white,
    // Vertical: 3,
  },
  headerRight: {
    // width: 40,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: -4,
    // paddingHorizontal: 12
  },
  headerRightPlaceholder: {
    width: 40,
  },
});
