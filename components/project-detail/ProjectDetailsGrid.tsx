import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Colors from "../../constants/Colors";

interface ProjectDetailsGridProps {
  type: string;
}

export const ProjectDetailsGrid = ({ type }: ProjectDetailsGridProps) => {
  return (
    <View style={styles.detailsGrid}>
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Type</Text>
        <Text style={styles.detailValue}>{type}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  detailsGrid: {
    flexDirection: "row",
    backgroundColor: Colors.dark.whiteTranslucentVeryLow,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.dark.whiteTranslucentLow,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    textTransform: "uppercase",
    fontWeight: "500",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: Colors.dark.white,
    fontWeight: "500",
  },
});
