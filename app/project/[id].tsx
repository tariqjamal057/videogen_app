import GradientButton from "@/components/common/GradientButton";
import {
  FILE_BASE_URL,
  useGenerateVideoMutation,
  useGetVideoStatusQuery,
} from "@/store/api/apiSlice";
import { MaterialIcons } from "@expo/vector-icons";
import * as FS from "expo-file-system/legacy";
import { LinearGradient } from "expo-linear-gradient";
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Dimensions,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { ReportModal } from "../../components/common/ReportModal";
import { ScreenHeader } from "../../components/common/ScreenHeader";
import { ProjectSourceContent } from "../../components/project-detail/ProjectSourceContent";
import { ProjectTitleSection } from "../../components/project-detail/ProjectTitleSection";
import { ProjectVideoPreview } from "../../components/project-detail/ProjectVideoPreview";
import Colors from "../../constants/Colors";
import { checkPromptSafety } from "../../lib/promptSafety";

const { width } = Dimensions.get("window");

import Toast from "react-native-toast-message";

export default function ProjectDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [orientation, setOrientation] = React.useState<
    "portrait" | "landscape"
  >("landscape");
  const [aspectRatio, setAspectRatio] = React.useState<number | undefined>(
    undefined
  );
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [reportModalVisible, setReportModalVisible] = React.useState(false);
  const {
    id,
    prompt: p_prompt,
    status: p_status,
    createdAt: p_createdAt,
    inputImages: p_inputImages,
    url: p_url,
    gifUrl: p_gifUrl,
    templateId: p_templateId,
    templateType: p_templateType,
    extractedThumbnail: p_extractedThumbnail,
    thumbnail: p_thumbnail,
  } = useLocalSearchParams();

  // Let's re-read the state part carefully.
  const [currentStatusState, setCurrentStatusState] = React.useState<number>(
    p_status ? parseInt(p_status as string) : 1
  );

  const { data: project } = useGetVideoStatusQuery(id as string, {
    skip: !id,
    pollingInterval: currentStatusState === 1 ? 10000 : 0,
  });

  const [generateVideo, { isLoading: isRetrying }] = useGenerateVideoMutation();

  React.useEffect(() => {
    if (project?.status) {
      setCurrentStatusState(project.status);
    }
  }, [project?.status]);

  const isImage = React.useMemo(() => {
    // 1. Check project data if available
    if (project) {
      if (project.uuid?.startsWith("img_")) return true;
      if (typeof project.templateId === "object" && (project.templateId as any)?.templateType === "image") return true;
      if ((project as any).templateType === "image") return true;
    }

    // 2. Check navigation params as fallback
    if (p_templateType === "image") return true;
    if (id?.toString().startsWith("img_")) return true;

    return false;
  }, [project, p_templateType, id]);

  // Use API data if available, otherwise fallback to navigation params
  const currentPrompt = project?.prompt || (p_prompt as string) || "";

  const templateData =
    project?.templateId && typeof project.templateId === "object"
      ? (project.templateId as any)
      : null;

  const currentTitle = templateData?.name || currentPrompt || (isImage ? "Untitled Image" : "Untitled Video");
  const currentDescription = project?.templateId
    ? templateData?.description || (templateData ? "" : currentPrompt)
    : "";
  const currentCreatedAt =
    project?.createdAt || (p_createdAt as string) || new Date().toISOString();
  const currentUrl = project?.url || (p_url as string) || "";
  const currentGifUrl = project?.gifUrl || (p_gifUrl as string) || "";
  const currentInputImages =
    project?.inputImages ||
    (p_inputImages ? JSON.parse(p_inputImages as string) : []);

  React.useEffect(() => {
    const imageToSize =
      currentInputImages?.[0] ||
      currentGifUrl ||
      (p_extractedThumbnail as string);
    if (imageToSize) {
      Image.getSize(
        imageToSize,
        (w: number, h: number) => {
          setOrientation(h > w ? "portrait" : "landscape");
          setAspectRatio(w / h);
        },
        () => {
          // Fallback to landscape on error
          setOrientation("landscape");
        }
      );
    }
  }, [currentInputImages, currentGifUrl, p_extractedThumbnail]);

  const handleDownload = async () => {
    if (!currentUrl) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `${isImage ? "Image" : "Video"} URL not found`,
      });
      return;
    }

    try {
      setIsDownloading(true);

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        Toast.show({
          type: "info",
          text1: "Permission Denied",
          text2: `We need permission to save ${isImage ? "images" : "videos"} to your gallery.`,
        });
        return;
      }

      const ext = isImage ? "webp" : "mp4";
      const fileName = `${isImage ? "ImageGen" : "VideoGen"}_${Date.now()}.${ext}`;
      const fileUri = (FS.documentDirectory || FS.cacheDirectory) + fileName;
      const downloadResult = await FS.downloadAsync(currentUrl, fileUri);

      if (downloadResult.status === 200) {
        await MediaLibrary.saveToLibraryAsync(downloadResult.uri);
        Toast.show({
          type: "success",
          text1: "Success",
          text2: `${isImage ? "Image" : "Video"} saved to gallery!`,
        });
      } else {
        throw new Error(`Failed to download ${isImage ? "image" : "video"}`);
      }
    } catch (error) {
      console.error("Download error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `Failed to download ${isImage ? "image" : "video"}. Please try again.`,
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRetry = async () => {
    // Safety Check
    const { isSafe } = checkPromptSafety(currentPrompt);
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
      formData.append("prompt", currentPrompt);
      if (project?.templateId) {
        formData.append(
          "templateId",
          typeof project.templateId === "string"
            ? project.templateId
            : (project.templateId as any)._id
        );
      }
      formData.append("useOnlyPrompt", project?.templateId ? "false" : "true");

      if (currentInputImages && currentInputImages.length > 0) {
        // Download and append images to FormData to ensure they are sent as files
        for (let i = 0; i < currentInputImages.length; i++) {
          let imgUrl = currentInputImages[i];
          if (imgUrl && !imgUrl.startsWith("http")) {
            imgUrl = `${FILE_BASE_URL}${imgUrl}`;
          }

          const fileName = imgUrl.split("/").pop() || `image_${i}.jpg`;
          const localUri = `${FS.cacheDirectory}${fileName}`;

          try {
            const { uri } = await FS.downloadAsync(imgUrl, localUri);
            const match = /\.(\w+)$/.exec(fileName);
            const type = match ? `image/${match[1]}` : "image/jpeg";

            formData.append("files", {
              uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
              name: fileName,
              type,
            } as any);
          } catch (downloadError) {
            console.error(
              `Failed to download image ${i} for retry:`,
              downloadError
            );
          }
        }
      }

      await generateVideo({
        body: formData,
        params: { isAiVideoTab: isImage ? "true" : "false" },
      }).unwrap();

      Toast.show({
        type: "success",
        text1: "Retrying...",
        text2: "Creation re-queued successfully.",
      });

      router.push("/projects");
    } catch (error) {
      console.error("Retry error:", error);
      Toast.show({
        type: "error",
        text1: "Retry Failed",
        text2: "Could not restart creation. Please try again.",
      });
    }
  };

  if (!project && !p_prompt) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ScreenHeader title="Creation Details" />
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              padding: 20,
            }}
          >
            <Text
              style={{
                color: Colors.dark.textMuted,
                textAlign: "center",
                lineHeight: 20,
              }}
            >
              Project not found or {"\n"} may have been deleted.
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const mappedProject = {
    title: currentTitle,
    thumbnail:
      (p_thumbnail as string) ||
      currentUrl ||
      currentGifUrl ||
      currentInputImages[0] ||
      (p_extractedThumbnail as string) ||
      "",
    status:
      currentStatusState === 2
        ? "Completed"
        : currentStatusState === 3
        ? "Failed"
        : "Processing",
    date: (() => {
      const d = new Date(currentCreatedAt);
      return `${String(d.getDate()).padStart(2, "0")}-${String(
        d.getMonth() + 1
      ).padStart(2, "0")}-${d.getFullYear()}`;
    })(),
    description: currentDescription,
    sourceImages: currentInputImages.map((img: string) => {
      if (img && !img.startsWith("http")) {
        return `${FILE_BASE_URL}${img}`;
      }
      return img;
    }),
    orientation: orientation,
    aspectRatio: aspectRatio,
    progress: project?.progress ?? 0,
    isFailed: currentStatusState === 3,
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.dark.gradientSecondaryStart, Colors.dark.background]}
        style={styles.background}
      />
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <ScreenHeader
          title="Creation Details"
          renderRight={() => {
            if (currentStatusState === 2) {
              return (
                <TouchableOpacity
                  onPress={() => setReportModalVisible(true)}
                  activeOpacity={0.7}
                >
                  <MaterialIcons
                    name="report"
                    size={24}
                    color={Colors.dark.error}
                  />
                </TouchableOpacity>
              );
            }
          }}
        />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scroll}
        >
          <ProjectVideoPreview
            thumbnail={mappedProject.thumbnail}
            mediaUrl={currentUrl}
            orientation={mappedProject.orientation as any}
            aspectRatio={mappedProject.aspectRatio}
            isFailed={mappedProject.isFailed}
            isImage={isImage}
          />

          <View style={styles.content}>
            <ProjectTitleSection
              title={mappedProject.title}
              description={mappedProject.description}
              status={mappedProject.status}
              date={mappedProject.date}
              progress={mappedProject.progress}
            />

            <ProjectSourceContent sourceImages={mappedProject.sourceImages} />
          </View>
        </ScrollView>

        <View
          style={[
            styles.actions,
            {
              marginBottom: Math.max(insets.bottom, 20),
            },
          ]}
        >
          {mappedProject.isFailed ? (
            <GradientButton
              title={isRetrying ? "Restarting..." : "Retry Creation"}
              icon="refresh"
              onPress={handleRetry}
              disabled={isRetrying}
            />
          ) : (
            <GradientButton
              title={isDownloading ? "Downloading..." : `Download ${isImage ? "Image" : "Video"}`}
              icon="file-download"
              disabled={currentStatusState !== 2 || isDownloading}
              onPress={handleDownload}
            />
          )}
        </View>
      </View>

      <ReportModal
        isVisible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        videoId={project?._id || (id as string)}
      />
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
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    height: 56,
  },
  backButton: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: Colors.dark.whiteTranslucentLow,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.dark.white,
    letterSpacing: -0.3,
  },
  headerRightPlaceholder: {
    width: 36,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  actions: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.dark.background,
  },
});
