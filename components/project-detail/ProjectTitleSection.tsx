import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import Colors from "../../constants/Colors";

interface ProjectTitleSectionProps {
  title: string;
  status: string;
  date: string;
  progress?: number;
}

export const ProjectTitleSection = ({
  title,
  status,
  date,
  progress,
}: ProjectTitleSectionProps) => {
  const isProcessing = status === "Processing";
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isProcessing) {
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
    } else {
      pulseAnim.setValue(1);
    }
  }, [isProcessing]);

  const dotColor =
    status === "Completed"
      ? Colors.dark.success
      : status === "Failed"
      ? Colors.dark.error
      : Colors.dark.warning;

  return (
    <View style={styles.titleSection}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.statusRow}>
        <View style={styles.statusBadge}>
          <Animated.View
            style={[
              styles.statusDot,
              {
                backgroundColor: dotColor,
                opacity: isProcessing ? pulseAnim : 1,
              },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              isProcessing && { color: Colors.dark.warning },
            ]}
          >
            {status}
            {isProcessing && progress !== undefined ? ` ${Math.round(progress)}%` : ""}
          </Text>
        </View>
        <Text style={styles.dateText}>{date}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  titleSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: "400",
    color: Colors.dark.white,
    marginBottom: 8,
    lineHeight: 22,
  },
  description: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    marginBottom: 12,
    lineHeight: 20,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.whiteTranslucentLow,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.dark.white,
    textTransform: "capitalize",
  },
  dateText: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    fontWeight: "500",
  },
});
