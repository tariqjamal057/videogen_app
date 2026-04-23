import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  ImageBackground,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import { GoogleLoginButton } from "../components/onboarding/GoogleLoginButton";
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
    "211053888115-st6ee0mmsgp4ai6fr5otvleg3ncjmb5b.apps.googleusercontent.com",
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
      router.replace("/");
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
          }),
        );
      }

      router.replace("/");
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
      <ImageBackground
        source={require("../assets/images/onboardingBg.png")}
        style={styles.background}
        resizeMode="cover"
      >
        <View
          style={[
            styles.content,
            {
              paddingTop: insets.top + 60,
              paddingBottom: Math.max(insets.bottom, 40),
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/Clipzo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.bottomContainer}>
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

            <Text style={styles.footerText}>
              By Signing in, you agree to our Terms of Services and Privacy
              Policy
            </Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  logo: {
    // width: 280,
    height: 250,
  },
  bottomContainer: {
    width: "100%",
    alignItems: "center",
  },
  footerText: {
    // marginTop: 10,
    fontFamily: "Molengo",
    fontSize: 9,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    paddingHorizontal: 20,
    // lineHeight: 18,
    // marginBottom: 5,
  },
  linkText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
