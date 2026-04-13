import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import Colors from "../../constants/Colors";

interface CloseButtonProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: "light" | "dark";
  size?: number;
}

export const CloseButton = ({
  onPress,
  style,
  variant = "light",
  size = 32,
}: CloseButtonProps) => {
  const isLight = variant === "light";
  const iconSize = Math.round(size * 0.6);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.button,
        isLight ? styles.lightButton : styles.darkButton,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      <Ionicons
        name="close"
        size={iconSize}
        color={isLight ? Colors.dark.black : Colors.dark.white}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  lightButton: {
    backgroundColor: Colors.dark.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  darkButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    borderWidth: 1,
    borderColor: Colors.dark.whiteTranslucentLow,
  },
});

export default CloseButton;
