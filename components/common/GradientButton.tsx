import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import Colors from "../../constants/Colors";

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  style?: ViewStyle;
  gradientStyle?: ViewStyle;
  textStyle?: TextStyle;
  colors?: readonly string[];
  activeOpacity?: number;
  disabled?: boolean;
}

export default function GradientButton({
  title,
  onPress,
  icon,
  style,
  gradientStyle,
  textStyle,
  colors = Colors.dark.buttonGradient,
  activeOpacity = 0.8,
  disabled = false,
}: GradientButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={activeOpacity}
      disabled={disabled}
      style={[styles.container, style, disabled && styles.disabled]}
    >
      <LinearGradient
        colors={colors as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, gradientStyle]}
      >
        {icon && (
          <MaterialIcons
            name={icon}
            size={22}
            color={Colors.dark.white}
            style={styles.icon}
          />
        )}
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 40,
    overflow: "hidden",
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  gradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  text: {
    color: Colors.dark.white,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  icon: {
    marginRight: 8,
  },
});
