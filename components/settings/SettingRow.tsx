import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "../../constants/Colors";

interface SettingRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightElement?: React.ReactNode;
  iconType?: "FontAwesome5" | "MaterialIcons";
}

export default function SettingRow({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  rightElement,
  iconType = "FontAwesome5",
}: SettingRowProps) {
  const IconComponent =
    iconType === "FontAwesome5" ? FontAwesome5 : MaterialIcons;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.leftContent}>
        <View style={styles.iconContainer}>
          <IconComponent
            name={icon as any}
            size={20}
            color={Colors.dark.text}
          />
        </View>
        <Text style={styles.label}>{label}</Text>
      </View>

      <View style={styles.rightContent}>
        {value && <Text style={styles.value}>{value}</Text>}
        {rightElement}
        {showChevron && (
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={Colors.dark.icon}
            style={styles.chevron}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "400",
    color: Colors.dark.text,
    marginLeft: 12,
  },
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  value: {
    fontSize: 16,
    color: Colors.dark.icon,
    marginRight: 8,
  },
  chevron: {
    marginLeft: 4,
  },
});
