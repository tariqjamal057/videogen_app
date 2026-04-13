import CloseButton from "@/components/common/CloseButton";
import GradientButton from "@/components/common/GradientButton";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { CreationInputs } from "../components/creation/CreationInputs";
import Colors from "../constants/Colors";
import { useGenerateVideoMutation } from "../store/api/apiSlice";

const { height } = Dimensions.get("window");

const TemplateDetailScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id, title, description, image, inputType, inputCount } = params;

  const count = parseInt(inputCount as string) || 1;
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const [generateVideo, { isLoading: isGenerating }] =
    useGenerateVideoMutation();

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

  const handleCreate = async () => {
    if (!isValid) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `Please select ${count} image(s).`,
      });
      return;
    }

    try {
      const formData = new FormData();
      if (id) formData.append("templateId", id as string);
      formData.append("prompt", "");
      formData.append("useOnlyPrompt", "false");

      selectedImages.forEach((uri, index) => {
        if (uri) {
          const fileName = uri.split("/").pop();
          const match = /\.(\w+)$/.exec(fileName || "");
          const type = match ? `image/${match[1]}` : `image`;
          formData.append("files", {
            uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
            name: fileName || `image_${index}.jpg`,
            type,
          } as any);
        }
      });

      await generateVideo({
        body: formData,
        params: { isAiVideoTab: "false" },
      }).unwrap();
      router.push("/(tabs)/projects");
    } catch (error: any) {
      console.error("Failed to generate video:", error);

      const errorMessage =
        error?.data?.msg ||
        error?.msg ||
        "Failed to generate video. Please try again.";
      const isInsufficientCredits = errorMessage
        .toLowerCase()
        .includes("credits");

      if (isInsufficientCredits) {
        Toast.show({
          type: "error",
          text1: "Insufficient Credits",
          text2: errorMessage,
          onPress: () => {
            Toast.hide();
            router.push("/plans");
          },
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Creation Error",
          text2: errorMessage,
        });
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.imageHeader}>
            <Image
              source={{ uri: image as string }}
              style={styles.headerImage}
              contentFit="cover"
              transition={300}
              cachePolicy="memory-disk"
            />
            <LinearGradient
              colors={["rgba(0,0,0,0.5)", "transparent"]}
              style={styles.headerGradient}
            />
            <CloseButton
              onPress={() => router.back()}
              style={styles.closeButton}
              variant="light"
              size={30}
            />
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>

            <View style={styles.inputSection}>
              <CreationInputs
                inputType={inputType as string}
                count={count}
                selectedImages={selectedImages}
                onPickImage={handlePickImage}
                onRemoveImage={handleRemoveImage}
              />
            </View>
          </View>
        </ScrollView>

        <View
          style={[styles.footer, { marginBottom: Math.max(insets.bottom) }]}
        >
          <GradientButton
            title={isGenerating ? "Creating..." : "Create"}
            onPress={handleCreate}
            disabled={isGenerating || !isValid}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageHeader: {
    width: "100%",
    height: height * 0.5,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
    backgroundColor: Colors.dark.surface,
  },
  headerImage: {
    width: "100%",
    height: "100%",
  },
  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    left: 12,
  },
  content: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.dark.white,
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 13,
    color: Colors.dark.textMuted,
    marginBottom: 20,
    lineHeight: 18,
    fontWeight: "500",
  },
  inputSection: {
    width: "100%",
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.dark.background,
  },
  footerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "100%",
    zIndex: -1,
  },
  createButton: {
    backgroundColor: "#6C5CE7",
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6C5CE7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  createButtonText: {
    color: Colors.dark.white,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});

export default TemplateDetailScreen;
