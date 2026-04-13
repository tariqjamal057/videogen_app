import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import * as VideoThumbnails from "expo-video-thumbnails";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../constants/Colors";
import { FILE_BASE_URL } from "../../store/api/apiSlice";

interface ProjectVideoPreviewProps {
  thumbnail: string;
  videoUrl?: string | null;
  orientation: "portrait" | "landscape";
  aspectRatio?: number;
  isFailed?: boolean;
}

export const ProjectVideoPreview = ({
  thumbnail: initialThumbnail,
  videoUrl,
  orientation,
  aspectRatio: manualAspectRatio,
  isFailed,
}: ProjectVideoPreviewProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [extractedThumbnail, setExtractedThumbnail] = useState<string | null>(
    null
  );

  useEffect(() => {
    async function getThumbnail() {
      // Skip if already have a local extracted thumbnail or if failed
      if (initialThumbnail?.startsWith("file://")) {
        return;
      }

      if (videoUrl && !isFailed) {
        // Ensure absolute URL
        const absoluteUrl = videoUrl.startsWith("http")
          ? videoUrl
          : `${FILE_BASE_URL}${videoUrl}`;

        try {
          const { uri } = await VideoThumbnails.getThumbnailAsync(absoluteUrl, {
            time: 0,
          });
          setExtractedThumbnail(uri);
        } catch (e) {
          console.warn("Error generating thumbnail:", e);
        }
      }
    }
    getThumbnail();
  }, [videoUrl, isFailed, initialThumbnail]);

  // Determine effective aspect ratio and width
  const isPortrait = manualAspectRatio
    ? manualAspectRatio < 1
    : orientation === "portrait";

  const effectiveAspectRatio =
    manualAspectRatio || (isPortrait ? 9 / 16 : 16 / 9);
  const effectiveWidth = isPortrait ? "65%" : "92%";

  const player = useVideoPlayer(null, (player) => {
    player.loop = false;
  });

  useEffect(() => {
    const subscription = player.addListener("playingChange", (payload) => {
      if (payload.isPlaying) {
        setIsBuffering(false);
      }
    });

    const statusSubscription = player.addListener("statusChange", (payload) => {
      if (payload.status === "readyToPlay") {
        setIsBuffering(false);
      }
    });

    return () => {
      subscription.remove();
      statusSubscription.remove();
    };
  }, [player]);

  const handlePlay = () => {
    if (!videoUrl || isFailed) return;
    setIsBuffering(true);
    player.replace(videoUrl);
    setIsPlaying(true);
    player.play();
  };

  const currentThumbnail = extractedThumbnail || initialThumbnail;

  return (
    <View
      style={[
        styles.videoContainer,
        {
          aspectRatio: effectiveAspectRatio,
          width: effectiveWidth,
        },
      ]}
    >
      {isPlaying && videoUrl && !isFailed ? (
        <View style={styles.preview}>
          <VideoView
            player={player}
            style={styles.preview}
            contentFit="cover"
            fullscreenOptions={{
              enable: true,
            }}
            allowsPictureInPicture
            nativeControls={true}
          />
          {isBuffering && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={Colors.dark.primary} />
            </View>
          )}
        </View>
      ) : (
        <View style={styles.preview}>
          {currentThumbnail ? (
            <Image
              source={{ uri: currentThumbnail }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: Colors.dark.surface,
                  justifyContent: "center",
                  alignItems: "center",
                },
              ]}
            >
              <Image
                source={require("../../assets/images/small-icon.png")}
                style={styles.placeholderIcon}
                resizeMode="contain"
              />
            </View>
          )}
          <TouchableOpacity
            style={[styles.playOverlay, isFailed && styles.failedOverlay]}
            activeOpacity={0.8}
            onPress={handlePlay}
            disabled={!videoUrl || isFailed}
          >
            <View
              style={[styles.playButton, isFailed && styles.failedPlayButton]}
            >
              {isFailed ? (
                <Ionicons
                  name="alert-circle"
                  size={40}
                  color={Colors.dark.white}
                />
              ) : (
                <MaterialIcons
                  name="play-arrow"
                  size={40}
                  color={Colors.dark.white}
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  videoContainer: {
    aspectRatio: 16 / 9,
    alignSelf: "center",
    marginTop: 16,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: Colors.dark.whiteTranslucentLow,
    borderWidth: 1,
    borderColor: Colors.dark.whiteTranslucent,
  },
  preview: {
    width: "100%",
    height: "100%",
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(168, 85, 247, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.2)",
  },
  failedOverlay: {
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  failedPlayButton: {
    backgroundColor: "rgba(239, 68, 68, 0.8)",
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  placeholderIcon: {
    width: 120,
    height: 120,
    opacity: 0.3,
    position: "absolute",
  },
});
