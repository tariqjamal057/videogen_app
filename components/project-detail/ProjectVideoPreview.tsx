import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import * as VideoThumbnails from "expo-video-thumbnails";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import Colors from "../../constants/Colors";
import { FILE_BASE_URL } from "../../store/api/apiSlice";
import { selectToken } from "../../store/slices/authSlice";

interface ProjectVideoPreviewProps {
  thumbnail: string;
  mediaUrl?: string | null;
  orientation: "portrait" | "landscape";
  aspectRatio?: number;
  isFailed?: boolean;
  isImage?: boolean;
}

export const ProjectVideoPreview = ({
  thumbnail: initialThumbnail,
  mediaUrl,
  orientation,
  aspectRatio: manualAspectRatio,
  isFailed,
  isImage,
}: ProjectVideoPreviewProps) => {
  const token = useSelector(selectToken);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [extractedThumbnail, setExtractedThumbnail] = useState<string | null>(
    null
  );

  // Ensure we have an absolute URL for the video/media
  const absoluteMediaUrl = useMemo(() => {
    if (!mediaUrl) return null;
    if (mediaUrl.startsWith("http") || mediaUrl.startsWith("file://") || mediaUrl.startsWith("content://")) {
      return mediaUrl;
    }
    return `${FILE_BASE_URL}${mediaUrl}`;
  }, [mediaUrl]);

  // Check if the URL is internal to our API/Fileserver
  const isInternalUrl = useMemo(() => {
    if (!absoluteMediaUrl) return false;
    return absoluteMediaUrl.startsWith(FILE_BASE_URL);
  }, [absoluteMediaUrl]);

  // Construct the source object for expo-video
  const videoSource = useMemo(() => {
    if (!absoluteMediaUrl) return null;
    
    const headers: Record<string, string> = {};
    // Only send Authorization header to our own server
    if (token && isInternalUrl) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    return {
      uri: absoluteMediaUrl,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
    };
  }, [absoluteMediaUrl, token, isInternalUrl]);

  useEffect(() => {
    async function getThumbnail() {
      if (isImage || !absoluteMediaUrl || isFailed) return;
      
      // Skip if already have a local extracted thumbnail
      if (initialThumbnail?.startsWith("file://")) {
        return;
      }

      try {
        const fetchHeaders: Record<string, string> = {};
        if (token && isInternalUrl) {
          fetchHeaders["Authorization"] = `Bearer ${token}`;
        }
        
        const { uri } = await VideoThumbnails.getThumbnailAsync(absoluteMediaUrl, {
          time: 0,
          headers: Object.keys(fetchHeaders).length > 0 ? fetchHeaders : undefined,
        });
        setExtractedThumbnail(uri);
      } catch (e) {
        console.warn("Error generating thumbnail:", e);
      }
    }
    getThumbnail();
  }, [absoluteMediaUrl, isFailed, initialThumbnail, isImage, token, isInternalUrl]);

  // Determine effective aspect ratio and width
  const isPortrait = manualAspectRatio
    ? manualAspectRatio < 1
    : orientation === "portrait";

  const effectiveAspectRatio =
    manualAspectRatio || (isPortrait ? 9 / 16 : 16 / 9);
  const effectiveWidth = isImage ? "100%" : (isPortrait ? "65%" : "92%");

  // Initialize player with the source if available to start preloading
  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = false;
  });

  useEffect(() => {
    const subscription = player.addListener("playingChange", (payload: { isPlaying: boolean }) => {
      console.log("Playing change:", payload.isPlaying);
      if (payload.isPlaying) {
        setIsBuffering(false);
      }
    });

    const statusSubscription = player.addListener("statusChange", (payload: { status: string; error?: any }) => {
      console.log("Video player status changed:", payload.status);
      if (payload.status === "readyToPlay") {
        setIsBuffering(false);
      } else if (payload.status === "loading") {
        setIsBuffering(true);
      } else if (payload.status === "error") {
        console.error("Video player error details:", JSON.stringify(payload.error, null, 2));
        setIsBuffering(false);
        setIsPlaying(false);
      }
    });

    return () => {
      subscription.remove();
      statusSubscription.remove();
    };
  }, [player]);

  const handlePlay = async () => {
    if (!videoSource || isFailed || isImage) return;
    
    setIsBuffering(true);
    setIsPlaying(true);
    
    try {
      console.log("Attempting to play video with source:", JSON.stringify(videoSource));
      // Use replaceAsync to avoid UI freezes and ensure proper async loading
      await player.replaceAsync(videoSource);
      player.play();
    } catch (error) {
      console.error("Error playing video:", error);
      setIsBuffering(false);
      setIsPlaying(false);
    }
  };

  const currentThumbnail = extractedThumbnail || initialThumbnail;
  
  // Also ensure thumbnail is absolute if it's a remote path
  const absoluteThumbnail = useMemo(() => {
    if (!currentThumbnail) return null;
    if (typeof currentThumbnail !== 'string') return currentThumbnail;
    if (currentThumbnail.startsWith("http") || currentThumbnail.startsWith("file://") || currentThumbnail.startsWith("content://") || currentThumbnail.startsWith("data:")) {
      return currentThumbnail;
    }
    return `${FILE_BASE_URL}${currentThumbnail}`;
  }, [currentThumbnail]);

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
      {isPlaying && absoluteMediaUrl && !isFailed && !isImage ? (
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
          {absoluteThumbnail ? (
            <Image
              source={{ 
                uri: absoluteThumbnail,
                headers: (token && isInternalUrl) ? { Authorization: `Bearer ${token}` } : {},
              }}
              style={StyleSheet.absoluteFill}
              contentFit={isImage ? "contain" : "cover"}
              transition={300}
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
                contentFit="contain"
              />
            </View>
          )}
          {!isImage && (
            <TouchableOpacity
              style={[styles.playOverlay, isFailed && styles.failedOverlay]}
              activeOpacity={0.8}
              onPress={handlePlay}
              disabled={!absoluteMediaUrl || isFailed}
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
          )}
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
