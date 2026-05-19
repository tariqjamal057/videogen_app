import { MaterialIcons } from "@expo/vector-icons";
import * as VideoThumbnails from "expo-video-thumbnails";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "../../constants/Colors";
import { FILE_BASE_URL } from "../../store/api/apiSlice";
import { StatusBadge } from "./StatusBadge";

interface Project {
  id: string;
  title: string;
  thumbnail: string;
  videoUrl?: string;
  gifUrl?: string;
  status: string;
  date: string;
  progress?: number;
  isImage?: boolean;
}

interface ProjectCardProps {
  project: Project;
  onPress: (id: string, extractedThumbnail?: string) => void;
}

export const ProjectCard = ({ project, onPress }: ProjectCardProps) => {
  const [extractedThumb, setExtractedThumb] = useState<string | null>(null);

  useEffect(() => {
    async function loadThumbnail() {
      if (project.isImage) return;
      // Always try to get a video frame for Completed projects for a premium look
      if (project.status === "Completed") {
        let sourceUrl = project.gifUrl || project.videoUrl;
        if (sourceUrl) {
          // Ensure absolute URL
          const absoluteUrl = sourceUrl.startsWith("http")
            ? sourceUrl
            : `${FILE_BASE_URL}${sourceUrl}`;

          try {
            const { uri } = await VideoThumbnails.getThumbnailAsync(
              absoluteUrl,
              {
                time: 0,
              }
            );
            setExtractedThumb(uri);
          } catch (e) {
            console.warn("ProjectCard: Error generating thumbnail", e);
          }
        }
      }
    }
    loadThumbnail();
  }, [project.videoUrl, project.gifUrl, project.status, project.isImage]);

  const displayThumbnail = extractedThumb || project.thumbnail;

  return (
    <TouchableOpacity
      key={project.id}
      style={styles.projectCard}
      activeOpacity={0.7}
      onPress={() => onPress(project.id, displayThumbnail || undefined)}
    >
      <View style={styles.thumbnailWrapper}>
        {displayThumbnail ? (
          <Image source={{ uri: displayThumbnail }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
            <Image
              source={require("../../assets/images/small-icon.png")}
              style={styles.placeholderIcon}
              resizeMode="contain"
            />
            {!project.isImage && (
              <MaterialIcons
                name="play-arrow"
                size={24}
                color={Colors.dark.primary}
              />
            )}
          </View>
        )}
      </View>

      <View style={styles.projectInfo}>
        <Text style={styles.projectTitle} numberOfLines={1}>
          {project.title}
        </Text>

        <View style={styles.projectFooter}>
          <StatusBadge status={project.status} progress={project.progress} />
          <Text style={styles.projectDetailText}>{project.date}</Text>
        </View>
      </View>

      <MaterialIcons
        name="chevron-right"
        size={20}
        color={Colors.dark.textDim}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  projectCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.whiteTranslucentVeryLow,
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.dark.whiteTranslucentLow,
  },
  thumbnailWrapper: {
    position: "relative",
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: Colors.dark.surfaceLight,
  },
  placeholderThumbnail: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(139, 92, 246, 0.1)",
  },
  placeholderIcon: {
    width: 32,
    height: 32,
    position: "absolute",
    opacity: 0.15,
  },
  projectInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  projectTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dark.text,
    marginBottom: 4,
  },
  projectDescription: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginBottom: 6,
  },
  projectFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  projectDetailText: {
    fontSize: 11,
    color: Colors.dark.textDim,
  },
});
