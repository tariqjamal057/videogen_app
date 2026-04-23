import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import * as Device from "expo-device";
import * as FS from "expo-file-system/legacy";
import { LinearGradient } from "expo-linear-gradient";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { ScreenHeader } from "../components/common/ScreenHeader";
import { Links } from "../constants/Links";
import { auth } from "../lib/firebase";
import {
  apiSlice,
  useDeleteVideoMutation,
  useGetGalleryQuery,
  useGetUserProfileQuery,
} from "../store/api/apiSlice";
import {
  logout,
  selectCurrentUser,
  selectToken,
  setCredentials,
} from "../store/slices/authSlice";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 45) / 2;

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<"videos" | "settings">("videos");
  const storeUser = useSelector(selectCurrentUser);
  const token = useSelector(selectToken);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const [deleteVideo] = useDeleteVideoMutation();

  const {
    data: apiUser,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useGetUserProfileQuery(undefined, {
    skip: !token,
  });

  const {
    data: videos,
    isLoading: isGalleryLoading,
    isFetching: isGalleryFetching,
    refetch: refetchGallery,
  } = useGetGalleryQuery(
    { page: 1, limit: 20 },
    {
      skip: !token || activeTab !== "videos",
      pollingInterval: activeTab === "videos" ? 10000 : 0,
    },
  );

  const user = apiUser || storeUser;

  useEffect(() => {
    if (apiUser && token) {
      dispatch(setCredentials({ user: apiUser, token }));
    }
  }, [apiUser, token, dispatch]);

  const handleRefresh = useCallback(async () => {
    if (activeTab === "settings") {
      await refetchUser();
    } else {
      dispatch(apiSlice.util.invalidateTags(["Project"]));
      await refetchGallery();
    }
  }, [refetchUser, refetchGallery, activeTab, dispatch]);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      await GoogleSignin.signOut();
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      dispatch(logout());
    }
  };

  const handleSupport = () => {
    const email = "Samirmahi3101@gmail.com";
    const subject = "Help & Support - Clipzo";
    const body = `Hi Support Team,\n\n[Describe your issue]\n\nUser ID: ${user?.id}\nDevice: ${Device.brand} ${Device.modelName}\nOS: ${Device.osName} ${Device.osVersion}`;
    Linking.openURL(
      `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    );
  };

  const handleDownload = async (url: string, isImage: boolean, id: string) => {
    if (!url) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `${isImage ? "Image" : "Video"} URL not found`,
      });
      return;
    }

    try {
      setDownloadingId(id);
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
      const downloadResult = await FS.downloadAsync(url, fileUri);

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
      setDownloadingId(null);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      "Delete Creation",
      "Are you sure you want to delete this creation?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteVideo(id).unwrap();
              Toast.show({
                type: "success",
                text1: "Deleted",
                text2: "Creation has been removed.",
              });
              dispatch(apiSlice.util.invalidateTags(["Project"]));
              refetchGallery();
            } catch (error) {
              console.error("Delete error:", error);
              Toast.show({
                type: "error",
                text1: "Error",
                text2: "Failed to delete creation.",
              });
            }
          },
        },
      ],
    );
  };

  const renderVideoItem = ({ item: video }: { item: any }) => {
    const isProcessing = video.status !== 2 && video.status !== 3;
    const progress = video.progress || 0;
    const isImage =
      video.uuid?.startsWith("img_") ||
      (typeof video.templateId === "object" &&
        video.templateId?.templateType === "image") ||
      video.templateType === "image";

    return (
      <TouchableOpacity
        style={styles.videoCard}
        activeOpacity={0.9}
        onPress={() => {
          router.push({
            pathname: "/project/[id]",
            params: {
              id: video._id,
              prompt: video.prompt,
              status: video.status.toString(),
              createdAt: video.createdAt,
              inputImages: JSON.stringify(video.inputImages || []),
              url: video.url || "",
              gifUrl: video.gifUrl || "",
              templateId:
                typeof video.templateId === "object"
                  ? video.templateId?._id
                  : video.templateId || "",
              templateType:
                typeof video.templateId === "object"
                  ? video.templateId?.templateType
                  : video.templateType || "",
              thumbnail: video.thumbnail || "",
            },
          });
        }}
      >
        <Image
          source={{
            uri: video.url || video.inputImages?.[0] || video.thumbnail,
          }}
          style={styles.videoThumbnail}
          resizeMode="cover"
          blurRadius={isProcessing ? 20 : 0}
        />

        {isProcessing ? (
          <View style={styles.processingOverlay}>
            <Text style={styles.progressText}>{progress}%</Text>
            <View style={styles.progressBarWrapper}>
              <View style={styles.progressBarBackground}>
                <LinearGradient
                  colors={["#0044E0", "#F20165"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressBarFill, { width: `${progress}%` }]}
                />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.actionOverlay}>
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.iconCircle}
                onPress={() => {
                  router.push({
                    pathname: "/project/[id]",
                    params: {
                      id: video._id,
                      prompt: video.prompt,
                      status: video.status.toString(),
                      createdAt: video.createdAt,
                      inputImages: JSON.stringify(video.inputImages || []),
                      url: video.url || "",
                      gifUrl: video.gifUrl || "",
                      templateId:
                        typeof video.templateId === "object"
                          ? video.templateId?._id
                          : video.templateId || "",
                      templateType:
                        typeof video.templateId === "object"
                          ? video.templateId?.templateType
                          : video.templateType || "",
                      thumbnail: video.thumbnail || "",
                    },
                  });
                }}
              >
                <Ionicons name="eye-outline" size={18} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconCircle}
                onPress={() => handleDelete(video._id)}
              >
                <Ionicons name="trash-outline" size={18} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconCircle}
                onPress={() => handleDownload(video.url, isImage, video._id)}
                disabled={downloadingId === video._id}
              >
                {downloadingId === video._id ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Ionicons name="download-outline" size={18} color="#FFF" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
        {!isProcessing && !isImage && (
          <View style={{ position: "absolute", top: "40%", left: "40%" }}>
            <MaterialIcons name="play-circle-outline" size={40} color="#FFF" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* <LinearGradient
        colors={[Colors.dark.gradientStart, Colors.dark.gradientEnd]}
        style={styles.background}
      /> */}

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <ScreenHeader title="My Profile" showCredits={false} />

        <View style={{ flex: 1 }}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isUserLoading || isGalleryFetching}
                onRefresh={handleRefresh}
                tintColor="#FFF"
              />
            }
            contentContainerStyle={{
              paddingBottom: activeTab === "settings" ? 100 : 20,
            }}
          >
            {/* Profile Section */}
            <View style={styles.profileSection}>
              <View style={styles.profileMain}>
                <View style={styles.avatarWrapper}>
                  {user?.profilePicture ? (
                    <Image
                      source={{ uri: user.profilePicture }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarInitial}>
                        {user?.name?.charAt(0)}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.profileInfo}>
                  <View>
                    <Text style={styles.userName}>{user?.name || "User"}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => router.push("/plans")}
                    style={styles.getCreditsBtnWrapper}
                  >
                    <LinearGradient
                      colors={["#0044E0", "#F20165"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.getCreditsBtn}
                    >
                      <Text style={styles.getCreditsText}>Get Credits</Text>
                      <MaterialIcons
                        name="chevron-right"
                        size={18}
                        color="#FFF"
                      />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Balance Card */}
            <View style={styles.balanceCard}>
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>Available Balance</Text>
              </View>
              <View style={styles.balanceContent}>
                <View style={styles.balanceValueRow}>
                  <Text style={styles.balanceValue}>{user?.credits ?? 0}</Text>
                  <Text style={styles.balanceUnit}>Credits</Text>
                </View>
                <TouchableOpacity
                  style={styles.historyBtn}
                  onPress={() => router.push("/purchase-history")}
                >
                  <MaterialCommunityIcons
                    name="history"
                    size={21}
                    color="rgba(255,255,255,0.6)"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => setActiveTab("videos")}
                activeOpacity={1}
              >
                {activeTab === "videos" ? (
                  <LinearGradient
                    colors={["#000", "#444"]}
                    style={[styles.tabGradient, styles.activeTabBorder]}
                  >
                    <Text style={styles.activeTabText}>My Creations</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.inactiveTab}>
                    <Text style={styles.inactiveTabText}>My Creations</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.tabItem}
                onPress={() => setActiveTab("settings")}
                activeOpacity={1}
              >
                {activeTab === "settings" ? (
                  <LinearGradient
                    colors={["#000", "#444"]}
                    style={[styles.tabGradient, styles.activeTabBorder]}
                  >
                    <Text style={styles.activeTabText}>Settings</Text>
                  </LinearGradient>
                ) : (
                  <View style={styles.inactiveTab}>
                    <Text style={styles.inactiveTabText}>Settings</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Content */}
            {activeTab === "videos" ? (
              <FlatList
                data={videos}
                renderItem={renderVideoItem}
                keyExtractor={(item) => item._id}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={styles.galleryGrid}
                columnWrapperStyle={styles.galleryRow}
                ListEmptyComponent={
                  !isGalleryLoading ? (
                    <View style={styles.emptyContainer}>
                      <Text style={styles.emptyText}>No creations yet</Text>
                    </View>
                  ) : (
                    <ActivityIndicator color="#FFF" style={{ marginTop: 20 }} />
                  )
                }
              />
            ) : (
              <View style={styles.settingsContainer}>
                <TouchableOpacity style={styles.settingRow} onPress={() => {}}>
                  <Text style={styles.settingLabel}>Rate App</Text>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color="rgba(255,255,255,0.5)"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={handleSupport}
                >
                  <Text style={styles.settingLabel}>Help & Support</Text>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color="rgba(255,255,255,0.5)"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() => Linking.openURL(Links.privacy)}
                >
                  <Text style={styles.settingLabel}>Privacy Policy</Text>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color="rgba(255,255,255,0.5)"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.settingRow}
                  onPress={() => Linking.openURL(Links.terms)}
                >
                  <Text style={styles.settingLabel}>Terms of Services</Text>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color="rgba(255,255,255,0.5)"
                  />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {activeTab === "settings" && (
            <View style={styles.footerContainer}>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <Text style={styles.logoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
  profileSection: {
    paddingHorizontal: 15,
    // marginTop: 10,
  },
  profileMain: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarWrapper: {
    width: 95,
    height: 93,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FFF",
  },
  profileInfo: {
    marginLeft: 20,
    flex: 1,
    height: 100,
    justifyContent: "space-between",
    // paddingVertical: 5,
  },
  userName: {
    fontSize: 20,
    fontFamily: "Molengo",
    fontWeight: "400",
    color: "#fff",
  },
  userEmail: {
    fontSize: 12,
    fontFamily: "Molengo",
    fontWeight: "400",
    color: "#d0d0d0",
    marginTop: 2,
  },
  getCreditsBtnWrapper: {
    alignSelf: "flex-start",
    borderRadius: 10,
    overflow: "hidden",
  },
  getCreditsBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8.5,
    paddingVertical: 7,
  },
  getCreditsText: {
    color: "#FFF",
    fontSize: 10,
    fontFamily: "Molengo",
    fontWeight: "400",
    marginRight: 4,
  },
  balanceCard: {
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  balanceHeader: {
    marginBottom: 5,
  },
  balanceLabel: {
    fontSize: 12,
    fontFamily: "Molengo",
    fontWeight: "400",
    color: "#fff",
  },
  balanceContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  balanceValue: {
    fontSize: 44,
    fontFamily: "Molengo",
    fontWeight: "400",
    color: "#FFF",
    lineHeight: 37
  },
  balanceUnit: {
    fontSize: 10,
    color: "#d0d0d0",
    fontFamily: "Molengo",
    fontWeight: "400",
    marginLeft: 8,
  },
  historyBtn: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    width: "100%",
    height: 45,
    marginTop: 15,
    marginBottom: 10,
  },
  tabItem: {
    flex: 1,
  },
  tabGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  activeTabBorder: {
    borderBottomWidth: 1.5,
    borderBottomColor: "#FFFFFF",
  },
  inactiveTab: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  activeTabText: {
    fontSize: 15,
    fontFamily: "Molengo",
    fontWeight: "400",
    color: "#fff",
  },
  inactiveTabText: {
    fontSize: 15,
    fontFamily: "Molengo",
    fontWeight: "400",
    color: "#fff",
  },
  galleryGrid: {
    paddingHorizontal: 15,
    paddingTop: 5,
    paddingBottom: 20,
  },
  galleryRow: {
    justifyContent: "space-between",
    // paddingHorizontal: 5,
  },
  videoCard: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.3,
    borderRadius: 16,
    marginBottom: 15,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
  },
  progressText: {
    fontSize: 52,
    fontWeight: "800",
    color: "#FFF",
    zIndex: 1,
  },
  progressBarWrapper: {
    position: "absolute",
    bottom: 15,
    width: "85%",
    alignSelf: "center",
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 5,
  },
  indicatorBox: {
    width: 50,
    height: 60,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  indicatorFill: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#0044E0",
    opacity: 0.6,
  },
  actionOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    // paddingHorizontal: 5,
    paddingVertical: 5,
    // backgroundColor: "rgba(0,0,0,0.3)",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgb(59, 59, 59)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  settingsContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5.5,
    // borderBottomWidth: 1,
    // borderBottomColor: "rgba(255,255,255,0.05)",
  },
  settingLabel: {
    fontSize: 14,
    color: "#FFF",
    // fontWeight: "500",
    fontFamily: "Molengo",
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "transparent",
  },
  logoutButton: {
    backgroundColor: "#FFF",
    height: 43,
    borderRadius: 26,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  logoutText: {
    color: "#000",
    fontSize: 14,
    // fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: "Molengo",
    fontWeight: "400",
    color: "#d0d0d0",
  },
});
