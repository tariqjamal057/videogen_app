import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { EmptyProjects } from "../components/projects/EmptyProjects";
import { ProjectCard } from "../components/projects/ProjectCard";
import Colors from "../constants/Colors";
import { apiSlice, useGetGalleryQuery } from "../store/api/apiSlice";

const LIMIT = 10;

export default function ProjectsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [page, setPage] = useState(1);
  const [pollingInterval, setPollingInterval] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    data: projects,
    isLoading,
    isFetching,
    refetch,
  } = useGetGalleryQuery(
    { page, limit: LIMIT },
    {
      pollingInterval,
    }
  );

  React.useEffect(() => {
    const hasProcessing = projects?.some(
      (p: any) => p.status !== 2 && p.status !== 3
    );
    setPollingInterval(hasProcessing ? 10000 : 0);
  }, [projects]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setPage(1);
    dispatch(apiSlice.util.invalidateTags(["Project"]));
    await refetch();
    setIsRefreshing(false);
  }, [refetch, dispatch]);

  const handleLoadMore = () => {
    if (!isFetching && projects && projects.length >= page * LIMIT) {
      setPage((prev) => prev + 1);
    }
  };

  const renderItem = ({ item: project }: { item: any }) => {
    const isImage = 
      project.uuid?.startsWith("img_") || 
      (typeof project.templateId === "object" && project.templateId?.templateType === "image") ||
      project.templateType === "image";

    return (
      <ProjectCard
        key={project._id}
        project={{
          id: project.uuid,
          title:
            project.prompt ||
            (typeof project.templateId === "object"
              ? project.templateId?.name
              : "Untitled Video"),
          description:
            typeof project.templateId === "object"
              ? project.templateId?.description
              : undefined,
          thumbnail: project.inputImages[0],
          videoUrl: project.url || undefined,
          gifUrl: project.gifUrl || undefined,
          status:
            project.status === 2
              ? "Completed"
              : project.status === 3
              ? "Failed"
              : "Processing",
          date: (() => {
            const d = new Date(project.createdAt);
            return `${String(d.getDate()).padStart(2, "0")}-${String(
              d.getMonth() + 1
            ).padStart(2, "0")}-${d.getFullYear()}`;
          })(),
          progress: project.progress,
          isImage: isImage,
        }}
        onPress={(id, extractedThumbnail) =>
          router.push({
            pathname: "/project/[id]",
            params: {
              id: id,
              prompt:
                project.prompt ||
                (typeof project.templateId === "object"
                  ? project.templateId?.name
                  : ""),
              status: project.status as any,
              createdAt: project.createdAt,
              inputImages: JSON.stringify(project.inputImages),
              url: project.url || "",
              gifUrl: project.gifUrl || "",
              thumbnail: extractedThumbnail || project.thumbnail || "",
              extractedThumbnail: extractedThumbnail || "",
              templateId:
                typeof project.templateId === "object"
                  ? project.templateId?._id
                  : project.templateId || "",
              templateType:
                typeof project.templateId === "object"
                  ? project.templateId?.templateType
                  : project.templateType || "",
            },
          })
        }
      />
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.dark.gradientSecondaryStart, Colors.dark.gradientEnd]}
        style={styles.background}
      />
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Gallery</Text>
        </View>

        <FlatList
          data={projects}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.dark.primary}
            />
          }
          ListEmptyComponent={
            !isLoading ? (
              <EmptyProjects onCreatePress={() => router.push("/ai-video")} />
            ) : null
          }
          ListFooterComponent={
            isFetching && projects && projects.length > 0 ? (
              <View style={styles.footerLoader}>
                <ActivityIndicator color={Colors.dark.primary} />
              </View>
            ) : null
          }
        />
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
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.dark.text,
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 8,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
