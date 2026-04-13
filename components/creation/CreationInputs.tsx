import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "../../constants/Colors";

interface CreationInputsProps {
  inputType: string;
  count: number;
  selectedImages: string[];
  onPickImage: (index: number) => void;
  onRemoveImage: (index: number) => void;
}

export const CreationInputs = ({
  inputType,
  count,
  selectedImages,
  onPickImage,
  onRemoveImage,
}: CreationInputsProps) => {
  if (inputType === "image") {
    if (count === 1) {
      const hasImage = selectedImages[0];
      return (
        <TouchableOpacity
          style={styles.singleImageUpload}
          activeOpacity={0.7}
          disabled={!!hasImage}
          onPress={() => !hasImage && onPickImage(0)}
        >
          {hasImage ? (
            <View style={styles.fullImageContainer}>
              <Image source={{ uri: hasImage }} style={styles.selectedImage} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => onRemoveImage(0)}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={16}
                  color={Colors.dark.white}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons
                  name="image-plus"
                  size={32}
                  color={Colors.dark.white}
                />
              </View>
              <Text style={styles.uploadText}>Tap here to upload</Text>
            </>
          )}
        </TouchableOpacity>
      );
    } else {
      return (
        <View style={styles.row}>
          {[0, 1].map((index) => {
            const hasImage = selectedImages[index];
            return (
              <TouchableOpacity
                key={index}
                style={styles.halfImageUpload}
                activeOpacity={0.7}
                disabled={!!hasImage}
                onPress={() => !hasImage && onPickImage(index)}
              >
                {hasImage ? (
                  <View style={styles.halfImageContainer}>
                    <Image
                      source={{ uri: hasImage }}
                      style={styles.selectedImage}
                    />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => onRemoveImage(index)}
                    >
                      <MaterialCommunityIcons
                        name="close"
                        size={14}
                        color={Colors.dark.white}
                      />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <View style={styles.iconCircleSmall}>
                      <MaterialCommunityIcons
                        name="image-plus"
                        size={24}
                        color={Colors.dark.white}
                      />
                    </View>
                    <Text style={styles.uploadTextSmall}>
                      Image {index + 1}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }
  }
  return null;
};

const styles = StyleSheet.create({
  singleImageUpload: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    height: 160,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.dark.whiteTranslucentLow,
    overflow: "hidden",
  },
  halfImageUpload: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    height: 160,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.dark.whiteTranslucentLow,
    overflow: "hidden",
  },
  fullImageContainer: {
    width: "50%",
    height: "100%",
    position: "relative",
  },
  halfImageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  removeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.dark.whiteTranslucentVeryLow,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  iconCircleSmall: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.dark.whiteTranslucentVeryLow,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    marginHorizontal: -8,
  },
  uploadText: {
    color: Colors.dark.text,
    fontSize: 15,
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 20,
  },
  uploadTextSmall: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});
