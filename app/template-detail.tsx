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
import { SafeAreaView } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import { MaterialIcons } from "@expo/vector-icons";
import { ScreenHeader } from "../components/common/ScreenHeader";
import Colors from "../constants/Colors";
import Toast from "react-native-toast-message";

const { width, height } = Dimensions.get("window");

export default function TemplateDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id, title, description, image, prompt } = params;

  const handleCopy = async () => {
    if (prompt) {
      await Clipboard.setStringAsync(prompt as string);
      Toast.show({
        type: "success",
        text1: "Copied",
        text2: "Prompt copied to clipboard",
      });
    }
  };

  const handleUsePrompt = () => {
    router.push({
      pathname: "/template-upload",
      params: { ...params },
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

          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>{description}</Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.copyIconButton} onPress={handleCopy} activeOpacity={0.7}>
            <MaterialIcons name="content-copy" size={20} color={Colors.dark.white} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.usePromptButton} onPress={handleUsePrompt} activeOpacity={0.9}>
            <LinearGradient
              colors={["#820036", "#FF006A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.usePromptGradient}
            >
              <Text style={styles.usePromptText}>Use This Prompt</Text>
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
    padding: 20,
  },
  demoWrapper: {
    width: "100%",
    height: height * 0.5,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: Colors.dark.surface,
    marginBottom: 20,
  },
  demoImage: {
    width: "100%",
    height: "100%",
  },
  descriptionBox: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  descriptionText: {
    fontSize: 14,
    color: "#FFFFFF",
    lineHeight: 22,
    opacity: 0.8,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 15,
    alignItems: "center",
    gap: 12,
  },
  copyIconButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  usePromptButton: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
  },
  usePromptGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  usePromptText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
