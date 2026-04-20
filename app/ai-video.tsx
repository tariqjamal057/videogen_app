import GradientButton from "@/components/common/GradientButton";
import HomeHeader from "@/components/home/HomeHeader";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { CustomTextInput } from "../components/common/CustomTextInput";
import Colors from "../constants/Colors";
import { Template } from "../constants/Templates";
import { checkPromptSafety } from "../lib/promptSafety";
import {
  useGenerateVideoMutation,
  useGetTopTemplatesQuery,
} from "../store/api/apiSlice";
import {
  selectCurrentPrompt,
  setPrompt,
} from "../store/slices/generationSlice";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 2;
const ITEM_WIDTH = (width - 48) / COLUMN_COUNT;
const MIN_PROMPT_LENGTH = 60;

export default function AIVideoScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isImage } = useLocalSearchParams();
  const dispatch = useDispatch();
  const reduxPrompt = useSelector(selectCurrentPrompt);
  const [localPrompt, setLocalPrompt] = useState("");

  const { data: templates } = useGetTopTemplatesQuery({ limit: 10 });
  const [generateVideo, { isLoading: isGenerating }] =
    useGenerateVideoMutation();

  useEffect(() => {
    if (reduxPrompt) {
      setLocalPrompt(reduxPrompt);
    }
  }, [reduxPrompt]);

  const handleTemplatePress = (template: Template) => {
    router.push({
      pathname: "/prompt-detail",
      params: {
        id: template.id,
        title: template.title,
        prompt: template.prompt,
        image: template.image,
        templateType: template.templateType,
      },
    });
  };

  const handleCreate = async () => {
    if (localPrompt.trim().length < MIN_PROMPT_LENGTH) return;

    // Safety Check
    const { isSafe } = checkPromptSafety(localPrompt);
    if (!isSafe) {
      Toast.show({
        type: "error",
        text1: "Policy Violation",
        text2:
          "This prompt violates our content policy and cannot be generated.",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("prompt", localPrompt);
      formData.append("useOnlyPrompt", "true");

      await generateVideo({
        body: formData,
        params: { isAiVideoTab: isImage === "true" ? "true" : "false" },
      }).unwrap();

      setLocalPrompt("");
      dispatch(setPrompt(""));
      router.push("/projects");
    } catch (error: any) {
      console.error(`Failed to generate ${isImage === "true" ? "image" : "video"}:`, error);

      const errorMessage =
        error?.data?.msg ||
        error?.msg ||
        `Failed to generate ${isImage === "true" ? "image" : "video"}. Please try again.`;
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

  const renderItem = ({ item }: { item: Template }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => handleTemplatePress(item)}
    >
      <Image
        source={require("../assets/images/transparent-icon.png")}
        style={[StyleSheet.absoluteFill, { opacity: 0.4 }]}
        contentFit="contain"
      />
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.4)"]}
        style={styles.gradient}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.dark.gradientStart, Colors.dark.gradientEnd]}
        style={styles.background}
      />

      <HomeHeader />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <FlatList
          data={templates}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={COLUMN_COUNT}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          ListHeaderComponent={
            <View style={styles.inputSection}>
              <CustomTextInput
                value={localPrompt}
                onChangeText={(text) => {
                  setLocalPrompt(text);
                  dispatch(setPrompt(text));
                }}
                height={180}
                minLength={MIN_PROMPT_LENGTH}
              />
            </View>
          }
        />

        <View style={styles.footer}>
          <GradientButton
            title={isGenerating ? "Creating..." : isImage === "true" ? "Generate Image" : "Generate Video"}
            onPress={handleCreate}
            activeOpacity={0.9}
            disabled={
              isGenerating || localPrompt.trim().length < MIN_PROMPT_LENGTH
            }
          />
        </View>
      </KeyboardAvoidingView>
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
  inputSection: {
    marginBottom: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.dark.background,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.5,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: Colors.dark.surface,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "100%",
  },
});
