import { MaterialIcons, FontAwesome5, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState, useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import Colors from "../constants/Colors";
import { Links } from "../constants/Links";
import { auth } from "../lib/firebase";
import { useGetUserProfileQuery, useGetGalleryQuery, apiSlice } from "../store/api/apiSlice";
import {
  logout,
  selectCurrentUser,
  selectToken,
  setCredentials,
} from "../store/slices/authSlice";
import { ScreenHeader } from "../components/common/ScreenHeader";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 45) / 2;

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<"videos" | "settings">("videos");
  const storeUser = useSelector(selectCurrentUser);
  const token = useSelector(selectToken);

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
  } = useGetGalleryQuery({ page: 1, limit: 20 }, {
    skip: !token || activeTab !== "videos",
    pollingInterval: activeTab === "videos" ? 10000 : 0,
  });

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
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  const renderVideoItem = ({ item: video }: { item: any }) => {
    const isProcessing = video.status !== 2 && video.status !== 3;
    const progress = video.progress || 0;
    const isImage = 
      video.uuid?.startsWith("img_") || 
      (typeof video.templateId === "object" && video.templateId?.templateType === "image") ||
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
              templateId: typeof video.templateId === 'object' ? video.templateId?._id : (video.templateId || ""),
              templateType: typeof video.templateId === 'object' ? video.templateId?.templateType : (video.templateType || ""),
              thumbnail: video.thumbnail || ""
            }
          });
        }}
      >
        <Image
          source={{ uri: video.url || video.inputImages?.[0] || video.thumbnail }}
          style={styles.videoThumbnail}
          resizeMode="cover"
        />
        
        {isProcessing ? (
          <View style={styles.processingOverlay}>
            <Text style={styles.progressText}>{progress}%</Text>
            <View style={styles.progressBarContainer}>
              <LinearGradient
                colors={["#0044E0", "#F20165"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressBar, { width: `${progress}%` }]}
              />
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
                      templateId: typeof video.templateId === 'object' ? video.templateId?._id : (video.templateId || ""),
                      templateType: typeof video.templateId === 'object' ? video.templateId?.templateType : (video.templateType || ""),
                      thumbnail: video.thumbnail || ""
                    }
                  });
                }}
              >
                <Ionicons name="eye-outline" size={18} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconCircle}>
                <Ionicons name="trash-outline" size={18} color="#FFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconCircle}>
                <Ionicons name="download-outline" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        {!isProcessing && !isImage && (
           <View style={{position: 'absolute', top: '40%', left: '40%'}}>
              <MaterialIcons name="play-circle-outline" size={40} color="#FFF" />
           </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.dark.gradientStart, Colors.dark.gradientEnd]}
        style={styles.background}
      />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <ScreenHeader title="My Profile" />

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
            contentContainerStyle={{ paddingBottom: activeTab === "settings" ? 100 : 20 }}
          >
            {/* Profile Section */}
            <View style={styles.profileSection}>
              <View style={styles.profileMain}>
                <View style={styles.avatarWrapper}>
                  {user?.profilePicture ? (
                    <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Text style={styles.avatarInitial}>{user?.name?.charAt(0)}</Text>
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
                      <MaterialIcons name="chevron-right" size={18} color="#FFF" />
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
                  <MaterialCommunityIcons name="history" size={21} color="rgba(255,255,255,0.6)" />
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
                    colors={["#444", "#000"]}
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
                    colors={["#444", "#000"]}
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
                  <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.settingRow} onPress={handleSupport}>
                  <Text style={styles.settingLabel}>Help & Support</Text>
                  <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.settingRow} onPress={() => Linking.openURL(Links.privacy)}>
                  <Text style={styles.settingLabel}>Privacy Policy</Text>
                  <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.settingRow} onPress={() => Linking.openURL(Links.terms)}>
                  <Text style={styles.settingLabel}>Terms of Services</Text>
                  <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          {activeTab === "settings" && (
            <View style={styles.footerContainer}>
              <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
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
    width: 100,
    height: 100,
    borderRadius: 16,
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
    fontSize: 14,
    fontWeight: "500",
    color: "#FFF",
  },
  userEmail: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
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
    fontSize: 12,
    fontWeight: "700",
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
    fontSize: 11.5,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
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
    fontSize: 26,
    fontWeight: "500",
    color: "#FFF",
  },
  balanceUnit: {
    fontSize: 10,
    color: "rgba(255,255,255,0.6)",
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
    borderBottomWidth: 2,
    borderBottomColor: "#FFFFFF",
  },
  inactiveTab: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  activeTabText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  inactiveTabText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    fontWeight: "600",
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
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 15,
  },
  progressBarContainer: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
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
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  settingLabel: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "500",
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
    height: 52,
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
    fontSize: 16,
    // fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 16,
  },
});
