import CloseButton from "@/components/common/CloseButton";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { Skeleton } from "../components/common/Skeleton";
import Colors from "../constants/Colors";
import { setPrompt } from "../store/slices/generationSlice";

const { height } = Dimensions.get("window");

function PromptDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const dispatch = useDispatch();
  const { prompt, image } = useLocalSearchParams();
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const handleCopy = async () => {
    try {
      const Clipboard = require("expo-clipboard");
      await Clipboard.setStringAsync(prompt as string);
    } catch (e) {
      console.error("Clipboard error:", e);
    }
  };

  const handleUsePrompt = () => {
    dispatch(setPrompt(prompt as string));
    router.replace("/ai-video");
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <View style={styles.imageContainer}>
        {!imageLoaded && (
          <Skeleton width="100%" height="100%" style={styles.imageSkeleton} />
        )}
        <Image
          source={{ uri: image as string }}
          style={styles.image}
          contentFit="cover"
          transition={300}
          onLoad={() => setImageLoaded(true)}
        />

        <CloseButton
          onPress={() => router.back()}
          style={[styles.closeButton, { top: insets.top + 20 }]}
          variant="light"
          size={30}
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.promptLabel}>Prompt</Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.promptText}>{prompt}</Text>
        </ScrollView>
      </View>

      <View
        style={[styles.footer, { marginBottom: Math.max(insets.bottom, 20) }]}
      >
        <TouchableOpacity style={styles.secondaryButton} onPress={handleCopy}>
          <Text style={styles.secondaryButtonText}>Copy</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleUsePrompt}
        >
          <LinearGradient
            colors={Colors.dark.buttonGradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryGradient}
          >
            <Text style={styles.primaryButtonText}>Use This Prompt</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default PromptDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  imageContainer: {
    width: "100%",
    height: height * 0.5,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  imageSkeleton: {
    position: "absolute",
    top: 0,
    left: 0,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  promptLabel: {
    fontSize: 16,
    color: Colors.dark.textMuted,
    marginBottom: 12,
  },
  promptText: {
    fontSize: 16,
    color: Colors.dark.white,
    lineHeight: 25,
    fontWeight: "400",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.dark.background,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 42,
    borderRadius: 28,
    backgroundColor: Colors.dark.surfaceLight,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: Colors.dark.white,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  primaryButton: {
    flex: 2,
    height: 42,
    borderRadius: 28,
    overflow: "hidden",
  },
  primaryGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    color: Colors.dark.white,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
});
