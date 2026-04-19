import { FontAwesome, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "../../constants/Colors";

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  renderRight?: () => React.ReactNode;
}

export function ScreenHeader({
  title,
  onBack,
  renderRight,
}: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={onBack || (() => router.back())}
        style={styles.backButton}
        activeOpacity={0.7}
      >
        <FontAwesome5
          name="arrow-left"
          size={18}
          color={Colors.dark.white}
        />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      {renderRight ? (
        <View style={styles.headerRight}>{renderRight()}</View>
      ) : (
        <View style={styles.headerRightPlaceholder} />
      )}
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 30,
    backgroundColor: Colors.dark.whiteTranslucentLow,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 18,
    // fontWeight: "600",
    color: Colors.dark.white,
    letterSpacing: -0.5,
  },
  headerRight: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: -4,
  },
  headerRightPlaceholder: {
    width: 40,
  },
});
