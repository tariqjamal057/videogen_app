import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  // @ts-expect-error: getReactNativePersistence is not in the type definitions for some environments
  getReactNativePersistence,
  initializeAuth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAWMlli6bIVgO-hPrV_8PCHhokREKcoNGk",
  authDomain: "clipzo-1009b.firebaseapp.com",
  projectId: "clipzo-1009b",
  storageBucket: "clipzo-1009b.firebasestorage.app",
  messagingSenderId: "211053888115",
  appId: "1:211053888115:web:1c3b0830567225beb2e006",
  measurementId: "G-WCK50GPK9J"
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
