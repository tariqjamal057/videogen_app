import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "../../constants/Colors";
import GradientButton from "../common/GradientButton";

interface EmptyProjectsProps {
  onCreatePress: () => void;
}

export const EmptyProjects = ({ onCreatePress }: EmptyProjectsProps) => {
  return (
    <View style={styles.emptyState}>
      <View style={styles.iconContainer}>
        <MaterialIcons
          name="video-library"
          size={64}
          color={Colors.dark.whiteTranslucent}
        />
      </View>

      <Text style={styles.emptyTitle}>You have nothing in gallery yet.</Text>
      <Text style={styles.emptySubtitle}>
        Not sure where to start?{"\n"}Try our prompts to get stunning results
      </Text>

      <GradientButton title="Try our prompts" onPress={onCreatePress} />
    </View>
  );
};

const styles = StyleSheet.create({
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  iconContainer: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark.white,
    textAlign: "center",
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },
});
