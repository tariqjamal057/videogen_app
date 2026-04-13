import React from "react";
import { Dimensions, Image, StyleSheet, View, ViewStyle } from "react-native";

const { width } = Dimensions.get("window");

interface AppLogoProps {
  size?: number;
  containerStyle?: ViewStyle;
}

export default function AppLogo({ size, containerStyle }: AppLogoProps) {
  const logoSize = size || width * 0.7;

  return (
    <View style={[styles.root, containerStyle]}>
      <Image
        source={require("../../assets/images/transparent-icon.png")}
        style={{
          width: logoSize,
          height: logoSize,
          borderRadius: 40,
        }}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
  },
});
