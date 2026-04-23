import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ScreenHeader } from "../components/common/ScreenHeader";
import UpgradeButton from "../components/home/UpgradeButton";
import Colors from "../constants/Colors";
import { Template } from "../constants/Templates";
import {
  useGenerateVideoMutation,
  useGetTopTemplatesQuery,
} from "../store/api/apiSlice";
import PrimaryButton from "../components/common/PrimaryButton";

const { width } = Dimensions.get("window");
const GRID_SPACING = 10;
const ITEM_WIDTH = (width - 40 - GRID_SPACING * 2) / 3;

const surpriseMePrompts = [
  "A futuristic city with flying cars and neon lights",
  "A cute baby dragon playing in a field of flowers",
  "An ancient underwater kingdom with glowing jellyfish",
  "A majestic phoenix rising from the ashes in cinematic style",
  "A cozy cabin in the woods during a snowfall",
];

export default function GenerationConfigScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const {
    id,
    selectedImages: selectedImagesStr,
    prompt: initialPrompt,
    isImage,
    templateType,
  } = params;

  const isImageGen = isImage === "true" || templateType === "image";
  const selectedImages = JSON.parse((selectedImagesStr as string) || "[]");
  const [prompt, setPrompt] = useState((initialPrompt as string) || "");
  const [quality, setQuality] = useState<"Normal" | "High">("Normal");
  const [duration, setDuration] = useState<"5 Sec" | "10 Sec" | "15 Sec">(
    "10 Sec",
  );

  const [generateVideo, { isLoading: isGenerating }] =
    useGenerateVideoMutation();
  const { data: topTemplates } = useGetTopTemplatesQuery({ limit: 6 });

  const handleSurpriseMe = () => {
    const randomPrompt =
      surpriseMePrompts[Math.floor(Math.random() * surpriseMePrompts.length)];
    setPrompt(randomPrompt);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter a prompt.",
      });
      return;
    }

    try {
      const formData = new FormData();
      if (id) formData.append("templateId", id as string);
      formData.append("prompt", prompt);
      formData.append("useOnlyPrompt", id ? "false" : "true");
      formData.append("quality", quality.toLowerCase());
      if (!isImageGen) {
        formData.append("duration", duration.split(" ")[0]);
      }

      selectedImages.forEach((uri: string, index: number) => {
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
        params: { isAiVideoTab: isImageGen ? "true" : "false" },
      }).unwrap();

      router.push("/projects");
    } catch (error: any) {
      console.error("Failed to generate:", error);
      const errorMessage =
        error?.data?.msg ||
        error?.msg ||
        `Failed to generate ${isImageGen ? "image" : "video"}.`;
      Toast.show({ type: "error", text1: "Error", text2: errorMessage });
    }
  };

  const renderTemplateItem = ({ item }: { item: Template }) => (
    <TouchableOpacity
      style={styles.gridCard}
      activeOpacity={0.8}
      onPress={() => {
        router.push({
          pathname: "/template-upload",
          params: { ...item, inputCount: item.inputCount.toString() },
        });
      }}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.gridImage}
        contentFit="cover"
        transition={200}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* <LinearGradient
        colors={[Colors.dark.gradientStart, Colors.dark.gradientEnd]}
        style={styles.background}
      /> */}
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScreenHeader
          title={isImageGen ? "Generate an Image" : "Generate a Video"}
          renderRight={() => <UpgradeButton />}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.inputSection}>
              <Text style={styles.label}>Prompt</Text>
              <View style={styles.textAreaWrapper}>
                <TextInput
                  style={styles.textArea}
                  multiline
                  placeholder="Enter your prompt here..."
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  value={prompt}
                  onChangeText={setPrompt}
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  style={styles.surpriseMeButton}
                  onPress={handleSurpriseMe}
                >
                  <Text style={styles.surpriseMeText}>🎲 Surprise Me</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.selectorRow}>
                <Text style={styles.selectorLabel}>Quality</Text>
                <View style={styles.btnGroup}>
                  {["Normal", "High"].map((q) => (
                    <TouchableOpacity
                      key={q}
                      style={[
                        styles.btn,
                        quality === q ? styles.btnActive : styles.btnInactive,
                      ]}
                      onPress={() => setQuality(q as any)}
                    >
                      <Text
                        style={[
                          styles.btnText,
                          quality === q
                            ? styles.btnTextActive
                            : styles.btnTextInactive,
                        ]}
                      >
                        {q}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {!isImageGen && (
                <View style={styles.selectorRow}>
                  <Text style={styles.selectorLabel}>Time</Text>
                  <View style={styles.btnGroup}>
                    {["5 Sec", "10 Sec", "15 Sec"].map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[
                          styles.btn,
                          duration === t
                            ? styles.btnActive
                            : styles.btnInactive,
                        ]}
                        onPress={() => setDuration(t as any)}
                      >
                        <Text
                          style={[
                            styles.btnText,
                            duration === t
                              ? styles.btnTextActive
                              : styles.btnTextInactive,
                          ]}
                        >
                          {t}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={styles.mainGenerateButton}
                onPress={handleGenerate}
                disabled={isGenerating}
              >
                <LinearGradient
                  colors={
                    isImageGen ? ["#002375", "#0047ED"] : ["#820036", "#FF006A"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.mainGenerateGradient}
                >
                  <Text style={styles.mainGenerateText}>
                    {isGenerating
                      ? "Generating..."
                      : isImageGen
                        ? "Generate Image"
                        : "Generate Video"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.trendingHeader}>
              <Text style={styles.trendingTitle}>Trending Templates</Text>
              {/* <TouchableOpacity onPress={() => {}}>
                <Text style={styles.seeAllText}>SEE ALL</Text>
              </TouchableOpacity> */}
            </View>

            <FlatList
              data={topTemplates}
              renderItem={renderTemplateItem}
              keyExtractor={(item) => item.id}
              numColumns={3}
              scrollEnabled={false}
              contentContainerStyle={styles.gridContainer}
              columnWrapperStyle={styles.gridRow}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  inputSection: {
    paddingHorizontal: 15,
  },
  label: {
    fontSize: 18,
    fontFamily: "Molengo",
    fontWeight: "400",
    color: Colors.dark.white,
    marginBottom: 12,
  },
  textAreaWrapper: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 15,
    height: 220,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 15,
  },
  textArea: {
    flex: 1,
    color: "#FFF",
    fontSize: 12,
    fontFamily: "Molengo",
    fontWeight: "400",
    lineHeight: 23,
  },
  surpriseMeButton: {
    alignSelf: "flex-end",
    backgroundColor: "#FFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  surpriseMeText: {
    color: "#000",
    fontSize: 11,
    fontFamily: "Molengo",
    fontWeight: "400",
  },
  selectorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  selectorLabel: {
    fontSize: 16,
    fontFamily: "Molengo",
    fontWeight: "400",
    color: Colors.dark.white,
  },
  btnGroup: {
    flexDirection: "row",
    gap: 8,
  },
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  btnActive: {
    backgroundColor: "#FFF",
  },
  btnInactive: {
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  btnText: {
   fontSize: 13,
    fontFamily: "Molengo",
    fontWeight: "400",
    color: Colors.dark.white,
  },
  btnTextActive: {
    color: "#000",
  },
  btnTextInactive: {
    color: "rgba(255,255,255,0.5)",
  },
  mainGenerateButton: {
    // height: 50,
    borderRadius: 25,
    overflow: "hidden",
    marginTop: 10,
  },
  mainGenerateGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  mainGenerateText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Molengo",
    fontWeight: "400",
    paddingVertical: 11.5,
    // fontWeight: "700",
  },
  trendingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  trendingTitle: {
    fontSize: 15,
    fontFamily: "Molengo",
    fontWeight: "400",
    color: Colors.dark.white,
  },
  seeAllText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    // fontWeight: "600",
  },
  gridContainer: {
    paddingHorizontal: 20,
  },
  gridRow: {
    justifyContent: "flex-start",
    gap: GRID_SPACING,
    marginBottom: GRID_SPACING,
  },
  gridCard: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.4,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
});
