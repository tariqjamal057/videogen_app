import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ScreenHeader } from "../components/common/ScreenHeader";
import Colors from "../constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function TemplateUploadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id, title, image, inputCount } = params;

  const count = parseInt(inputCount as string) || 1;
  const [selectedImages, setSelectedImages] = useState<string[]>(new Array(count).fill(""));

  const handlePickImage = async (index: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission Denied",
        text2: "We need access to your gallery to upload images.",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newImages = [...selectedImages];
      newImages[index] = result.assets[0].uri;
      setSelectedImages(newImages);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...selectedImages];
    newImages[index] = "";
    setSelectedImages(newImages);
  };

  const isValid = selectedImages.filter((img) => img).length === count;

  const handleGenerateVideo = () => {
    if (!isValid) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `Please select ${count} image(s).`,
      });
      return;
    }

    router.push({
      pathname: "/generation-config",
      params: { 
        ...params,
        selectedImages: JSON.stringify(selectedImages)
      },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.dark.gradientStart, Colors.dark.gradientEnd]}
        style={styles.background}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <ScreenHeader title={title as string} />
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.demoWrapper}>
            <Image
              source={{ uri: image as string }}
              style={styles.demoImage}
              contentFit="cover"
              transition={300}
            />
          </View>

          <View style={styles.uploadSection}>
            <View style={styles.uploadGrid}>
              {selectedImages.map((uri, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.uploadBox}
                  onPress={() => (uri ? handleRemoveImage(index) : handlePickImage(index))}
                  activeOpacity={0.8}
                >
                  {uri ? (
                    <View style={styles.selectedImageContainer}>
                      <Image source={{ uri }} style={styles.selectedImage} />
                      <View style={styles.removeBadge}>
                        <MaterialCommunityIcons name="close" size={14} color="#FFF" />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <MaterialCommunityIcons name="image-outline" size={60} color="rgba(255,255,255,0.6)" />
                      <Text style={styles.uploadLabel}>Image {index + 1}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <Text style={styles.hintText}>
              Upload your images in these boxes to create a video like this.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.generateButton, !isValid && styles.disabledButton]}
            onPress={handleGenerateVideo}
            disabled={!isValid}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={["#820036", "#FF006A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.generateGradient}
            >
              <Text style={styles.generateButtonText}>Generate Video</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContent: {
    paddingHorizontal: 15,
  },
  demoWrapper: {
    width: "100%",
    height: height * 0.49,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: Colors.dark.surface,
    marginBottom: 20,
  },
  demoImage: {
    width: "100%",
    height: "100%",
  },
  uploadSection: {
    alignItems: "center",
  },
  uploadGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    gap: 15,
  },
  uploadBox: {
    flex: 1,
    aspectRatio: 1,
    minWidth: "45%",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  selectedImageContainer: {
    width: "100%",
    height: "100%",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
  },
  removeBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  uploadLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
  },
  hintText: {
    fontSize: 8,
    color: Colors.dark.textMuted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 18,
    paddingHorizontal: 30,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  generateButton: {
    width: "100%",
    height: 43,
    borderRadius: 25,
    overflow: "hidden",
  },
  generateGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  generateButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    // fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.5,
  },
});
