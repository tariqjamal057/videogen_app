import { Image } from "expo-image";
import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import UpgradeButton from "./UpgradeButton";

interface HomeHeaderProps {
  style?: ViewStyle;
}

export default function HomeHeader({ style }: HomeHeaderProps) {
  return (
    <View style={[styles.container, style]}>
      <Image
        source={require("../../assets/images/small-icon.png")}
        style={styles.logo}
        contentFit="contain"
      />
      <UpgradeButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 10,
    width: "100%",
    zIndex: 10,
  },
  logo: {
    width: 40,
    height: 40,
  },
});
