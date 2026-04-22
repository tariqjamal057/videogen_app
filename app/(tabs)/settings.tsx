import { MaterialIcons } from "@expo/vector-icons";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import Constants from "expo-constants";
import * as Device from "expo-device";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
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
import CreditsCard from "../../components/settings/CreditsCard";
import { ProfileCard } from "../../components/settings/ProfileCard";
import SettingRow from "../../components/settings/SettingRow";
import Colors from "../../constants/Colors";
import { Links } from "../../constants/Links";
import { auth } from "../../lib/firebase";
import { useGetUserProfileQuery } from "../../store/api/apiSlice";
import {
  logout,
  selectCurrentUser,
  selectToken,
  setCredentials,
} from "../../store/slices/authSlice";

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const storeUser = useSelector(selectCurrentUser);
  const token = useSelector(selectToken);
  const {
    data: apiUser,
    isLoading,
    refetch,
    isFetching,
  } = useGetUserProfileQuery(undefined, {
    skip: !token,
  });

  const user = apiUser || storeUser;

  const handleRefresh = React.useCallback(async () => {
    await refetch();
  }, [refetch]);

  React.useEffect(() => {
    if (apiUser && token) {
      dispatch(setCredentials({ user: apiUser, token }));
    }
  }, [apiUser, token, dispatch]);

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
    const subject = "Help & Support - VideoGen";
    const deviceMsg = `
---
User ID: ${user?.id || user?.authId || "N/A"}
Device: ${Device.brand} ${Device.modelName}
OS: ${Device.osName} ${Device.osVersion}
App Version: ${Constants.expoConfig?.version || "1.0.0"}
`;
    const body = `Hi Support Team,\n\n[Please describe your issue here]\n\n${deviceMsg}`;

    const url = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    Linking.openURL(url);
  };

  const handleRateApp = () => {
    const packageName =
      Constants.expoConfig?.android?.package || "com.videogen.app";
    const url = Platform.select({
      android: `https://play.google.com/store/apps/details?id=${packageName}`,
      ios: `itms-apps://itunes.apple.com/app/viewContentsUserReviews/idYOUR_APP_ID?action=write-review`, // Replace with actual ID when available
    });

    if (url) {
      Linking.canOpenURL(url).then((supported) => {
        Linking.openURL(url);
      });
    }
  };

  return (
    <View style={styles.container}>
      {/* <LinearGradient
        colors={[Colors.dark.gradientStart, Colors.dark.gradientEnd]}
        style={styles.background}
      /> */}

      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={handleRefresh}
              tintColor={Colors.dark.primary}
            />
          }
        >
          {user ? (
            <ProfileCard
              name={user.name}
              email={user.email}
              profilePicture={user.profilePicture}
            />
          ) : (
            <View
              style={{
                height: 80,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator color={Colors.dark.primary} />
            </View>
          )}

          <CreditsCard />

          <View style={styles.section}>
            <SettingRow
              icon="grade"
              label="Rate App"
              iconType="MaterialIcons"
              onPress={handleRateApp}
            />
            <SettingRow
              icon="help"
              label="Help & Support"
              iconType="MaterialIcons"
              onPress={handleSupport}
            />
            <SettingRow
              icon="security"
              label="Privacy Policy"
              iconType="MaterialIcons"
              onPress={() => Linking.openURL(Links.privacy)}
            />
            <SettingRow
              icon="gavel"
              label="Terms of Service"
              iconType="MaterialIcons"
              onPress={() => Linking.openURL(Links.terms)}
            />
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <MaterialIcons name="logout" size={20} color={Colors.dark.error} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </ScrollView>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    paddingBottom: 10,
  },
  section: {
    marginTop: 12,
  },
  logoutButton: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    opacity: 0.6,
  },
  logoutText: {
    color: Colors.dark.error,
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 8,
  },
});
