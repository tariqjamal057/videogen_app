import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Colors from "../../constants/Colors";

interface StatusBadgeProps {
  status: string;
  progress?: number;
}

export const StatusBadge = ({ status, progress }: StatusBadgeProps) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === "Processing") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [status]);

  const getStatusColor = () => {
    switch (status) {
      case "Completed":
        return Colors.dark.success;
      case "Failed":
        return Colors.dark.error;
      default:
        return Colors.dark.warning;
    }
  };

  const statusColor = getStatusColor();

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.statusDot,
          {
            backgroundColor: statusColor,
            opacity: status === "Processing" ? pulseAnim : 1,
          },
        ]}
      />
      {status === "Processing" && progress !== undefined && (
        <Text style={[styles.progressText, { color: statusColor }]}>
          {progress}%
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  progressText: {
    fontSize: 11,
    fontWeight: "600",
    marginRight: 8,
  },
});
