import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Colors from "../../constants/Colors";

interface ProjectSourceContentProps {
  sourceImages?: string[];
}

export const ProjectSourceContent = ({
  sourceImages,
}: ProjectSourceContentProps) => {
  if (sourceImages && sourceImages.length > 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Source Images</Text>
        <View style={styles.sourceImagesGrid}>
          {sourceImages.map((img, index) => (
            <View key={index} style={styles.sourceImageWrapper}>
              <Image source={{ uri: img }} style={styles.sourceImage} />
              <View style={styles.imageIndexBadge}>
                <Text style={styles.imageIndexText}>{index + 1}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  }
  return null;
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.white,
    marginBottom: 12,
  },
  sourceImagesGrid: {
    flexDirection: "row",
    gap: 12,
  },
  sourceImageWrapper: {
    width: 100,
    height: 100,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.dark.whiteTranslucent,
    position: "relative",
  },
  sourceImage: {
    width: "100%",
    height: "100%",
  },
  imageIndexBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  imageIndexText: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.dark.white,
  },
  promptContainer: {
    backgroundColor: Colors.dark.whiteTranslucentVeryLow,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.dark.whiteTranslucentLow,
    position: "relative",
  },
  promptText: {
    fontSize: 14,
    color: Colors.dark.text,
    lineHeight: 22,
    fontWeight: "500",
    paddingRight: 32,
  },
  copyButton: {
    position: "absolute",
    right: 12,
    top: 12,
    padding: 8,
    backgroundColor: Colors.dark.whiteTranslucentLow,
    borderRadius: 8,
  },
});
