import Colors from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  activeOpacity?: number;
  disabled?: boolean;
  colors?: string[];
}

export default function PrimaryButton({
  title,
  onPress,
  style,
  textStyle,
  activeOpacity = 0.8,
  disabled = false,
  colors = ["#002375", "#0047ED"],
}: PrimaryButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={activeOpacity}
      disabled={disabled}
      style={[styles.container, style, disabled && styles.disabled]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.button}
      >
        <Text style={[styles.buttonText, textStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  disabled: {
    opacity: 0.5,
  },
  button: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 9,
    fontFamily: "Molengo",
    fontWeight: "400",
    color: Colors.dark.white,
  },
});
