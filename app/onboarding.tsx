import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { GoogleLoginButton } from "../components/onboarding/GoogleLoginButton";
import { OnboardingHeader } from "../components/onboarding/OnboardingHeader";
import Colors from "../constants/Colors";
import { Links } from "../constants/Links";
import { auth } from "../lib/firebase";
import { useRegisterUserMutation } from "../store/api/apiSlice";
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectToken,
  setCredentials,
} from "../store/slices/authSlice";

WebBrowser.maybeCompleteAuthSession();

GoogleSignin.configure({
  webClientId:
    "36261426044-jpffd57qfrspj9uag355ldss4ov1otll.apps.googleusercontent.com",
  offlineAccess: true,
});

import Toast from "react-native-toast-message";

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const token = useSelector(selectToken);
  const user = useSelector(selectCurrentUser);
  const isProfileLoading = !!(token && !user);
  const [registerUser, { isLoading: isRegistering }] =
    useRegisterUserMutation();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated]);

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const { data } = await GoogleSignin.signIn();
      const idToken = data?.idToken;
      if (!idToken) {
        throw new Error("No ID Token found in response");
      }

      const credential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, credential);

      const firebaseToken = await auth.currentUser?.getIdToken();
      if (!firebaseToken) {
        throw new Error("Failed to get Firebase token");
      }

      const result = await registerUser({ token: firebaseToken }).unwrap();

      if (result && result.id) {
        dispatch(
          setCredentials({
            user: result,
            token: firebaseToken,
          })
        );
      }

      router.replace("/(tabs)");
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log("User cancelled the login flow");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log("Login in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Play services not available or outdated",
        });
      } else {
        console.error("Google Login Error:", error);
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: error.message || "Failed to login with Google",
        });
      }
    }
  };

  if (isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          Colors.dark.gradientStart,
          Colors.dark.gradientMiddle,
          Colors.dark.gradientEnd,
        ]}
        style={styles.background}
      />

      <View style={styles.content}>
        <OnboardingHeader />

        {isProfileLoading ? (
          <View style={{ height: 52, justifyContent: "center" }}>
            <ActivityIndicator size="large" color={Colors.dark.primary} />
          </View>
        ) : (
          <GoogleLoginButton
            onPress={handleGoogleLogin}
            isLoading={isRegistering}
          />
        )}

        <Text
          style={[
            styles.footerText,
            {
              bottom: Math.max(
                insets.bottom,
                Platform.OS === "android" ? 30 : 20
              ),
            },
          ]}
        >
          By continuing, you agree to our{" "}
          <Text
            style={styles.linkText}
            onPress={() => Linking.openURL(Links.terms)}
          >
            Terms
          </Text>{" "}
          and{" "}
          <Text
            style={styles.linkText}
            onPress={() => Linking.openURL(Links.privacy)}
          >
            Privacy Policy
          </Text>
        </Text>
      </View>
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  footerText: {
    position: "absolute",
    bottom: 40,
    fontSize: 12,
    color: Colors.dark.textDim,
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 16,
    marginBottom: 5,
  },
  linkText: {
    color: Colors.dark.primary,
    fontWeight: "400",
    textDecorationLine: "underline",
  },
});
