import { MaterialIcons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3DarkTheme, PaperProvider } from "react-native-paper";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "index",
};

import Toast, { ToastConfig } from "react-native-toast-message";
import { Provider, useDispatch, useSelector } from "react-redux";
import { IAPHandler } from "../components/IAPHandler";
import Colors from "../constants/Colors";
import { auth } from "../lib/firebase";
import { preCacheVideos } from "../lib/videoCache";
import { store } from "../store";
import {
  useGetPlansQuery,
  useGetUserProfileQuery,
} from "../store/api/apiSlice";
import {
  logout,
  selectIsAuthenticated,
  selectIsInitializing,
  selectToken,
  setInitializing,
  setToken,
} from "../store/slices/authSlice";

SplashScreen.preventAutoHideAsync();

const toastConfig: ToastConfig = {
  success: (props) => (
    <View style={toastStyles.wrapper}>
      <View
        style={[toastStyles.container, { borderColor: Colors.dark.success }]}
      >
        <MaterialIcons
          name="check-circle"
          size={20}
          color={Colors.dark.success}
        />
        <View style={toastStyles.content}>
          <Text style={toastStyles.text1}>{props.text1}</Text>
          {props.text2 && <Text style={toastStyles.text2}>{props.text2}</Text>}
        </View>
      </View>
    </View>
  ),
  error: (props) => (
    <View style={toastStyles.wrapper}>
      <View style={[toastStyles.container, { borderColor: Colors.dark.error }]}>
        <MaterialIcons name="error" size={20} color={Colors.dark.error} />
        <View style={toastStyles.content}>
          <Text style={toastStyles.text1}>{props.text1}</Text>
          {props.text2 && <Text style={toastStyles.text2}>{props.text2}</Text>}
        </View>
      </View>
    </View>
  ),
  info: (props) => (
    <View style={toastStyles.wrapper}>
      <View
        style={[toastStyles.container, { borderColor: Colors.dark.primary }]}
      >
        <MaterialIcons name="info" size={20} color={Colors.dark.primary} />
        <View style={toastStyles.content}>
          <Text style={toastStyles.text1}>{props.text1}</Text>
          {props.text2 && <Text style={toastStyles.text2}>{props.text2}</Text>}
        </View>
      </View>
    </View>
  ),
};

const toastStyles = StyleSheet.create({
  wrapper: {
    width: "100%",
    paddingHorizontal: 16,
    marginTop: 8,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(20, 20, 25, 0.95)",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    marginLeft: 12,
    flexShrink: 1,
  },
  text1: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  text2: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 1,
    fontWeight: "500",
  },
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // SplashScreen hiding is handled in RootLayoutNav

  if (!loaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <RootLayoutNav loaded={loaded} />
      </SafeAreaProvider>
    </Provider>
  );
}

function RootLayoutNav({ loaded }: { loaded: boolean }) {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isInitializing = useSelector(selectIsInitializing);
  const segments = useSegments();
  const router = useRouter();

  useGetPlansQuery();
  const { isLoading: isProfileLoading } = useGetUserProfileQuery(undefined, {
    skip: !token,
  });

  const isActuallyInitializing =
    isInitializing || (!!token && isProfileLoading);

  useEffect(() => {
    if (isInitializing) return;

    const inAuthGroup =
      !segments[0] ||
      segments[0] === "ai-video" ||
      segments[0] === "projects" ||
      segments[0] === "settings" ||
      segments[0] === "project" ||
      segments[0] === "creation" ||
      segments[0] === "all-plans" ||
      segments[0] === "plans" ||
      segments[0] === "prompt-detail" ||
      segments[0] === "purchase-history" ||
      segments[0] === "template-detail" ||
      segments[0] === "template-upload" ||
      segments[0] === "generation-config";

    if (!isAuthenticated && inAuthGroup) {
      router.replace("/onboarding");
    } else if (isAuthenticated && segments[0] === "onboarding") {
      router.replace("/");
    }
  }, [isAuthenticated, segments, isInitializing]);

  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      if (user) {
        const token = await user.getIdToken();
        dispatch(setToken(token));
      } else {
        dispatch(logout());
      }
      dispatch(setInitializing(false));
    });

    return unsubscribe;
  }, [dispatch]);

  useEffect(() => {
    if (loaded && !isInitializing) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isInitializing]);

  useEffect(() => {
    preCacheVideos();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DarkTheme}>
        <PaperProvider theme={MD3DarkTheme}>
          <IAPHandler />
          <Stack
            screenOptions={{
              contentStyle: { backgroundColor: "#000000" },
              headerShown: false,
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="ai-video" options={{ headerShown: false }} />
            <Stack.Screen name="projects" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen
              name="creation"
              options={{ headerShown: false, presentation: "transparentModal" }}
            />
            <Stack.Screen name="all-plans" options={{ headerShown: false }} />
            <Stack.Screen name="plans" options={{ headerShown: false }} />
            <Stack.Screen
              name="project/[id]"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="prompt-detail"
              options={{ headerShown: false, presentation: "modal" }}
            />
            <Stack.Screen
              name="purchase-history"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="template-detail"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="template-upload"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="generation-config"
              options={{ headerShown: false }}
            />
          </Stack>
          <Toast config={toastConfig} />
        </PaperProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
