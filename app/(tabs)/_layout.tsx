import { FontAwesome5 } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Redirect } from "expo-router";
import { useSelector } from "react-redux";
import {
  selectIsAuthenticated,
  selectIsInitializing,
} from "../../store/slices/authSlice";

import Colors from "../../constants/Colors";

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitializing = useSelector(selectIsInitializing);
  const colorScheme = "dark";

  const tabPaddingBottom = Platform.OS === "ios" ? 32 : Math.max(insets.bottom);
  const tabHeight = (Platform.OS === "ios" ? 88 : 64) + tabPaddingBottom;

  if (isInitializing) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme].background,
          borderTopWidth: 1,
          borderTopColor: Colors[colorScheme].border,
          height: tabHeight,
          paddingBottom: tabPaddingBottom,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginBottom: Platform.OS === "android" ? 6 : 0,
        },
        tabBarActiveTintColor: Colors[colorScheme].tint,
        tabBarInactiveTintColor: Colors[colorScheme].tabIconDefault,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Discover",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="compass" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="ai-video"
        options={{
          title: "AI Video",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="video" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="projects"
        options={{
          title: "Gallery",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="film" size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <FontAwesome5 name="cog" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
