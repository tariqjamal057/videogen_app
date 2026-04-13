import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  // @ts-expect-error: getReactNativePersistence is not in the type definitions for some environments
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDqIBrnc5HKA25o9wLs-4A288I9QRPlsd0",
  authDomain: "videogen-e5b7a.firebaseapp.com",
  projectId: "videogen-e5b7a",
  storageBucket: "videogen-e5b7a.firebasestorage.app",
  messagingSenderId: "36261426044",
  appId: "1:36261426044:web:680b82041aa86918f86af9",
  measurementId: "G-S0GRHWGV2S",
};

export const app =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const analytics = isSupported().then((yes) =>
  yes ? getAnalytics(app) : null
);

export default app;
