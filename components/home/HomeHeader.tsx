import { FontAwesome5 } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { useSelector } from "react-redux";
import Colors from "../../constants/Colors";
import { selectCurrentUser } from "../../store/slices/authSlice";
import UpgradeButton from "./UpgradeButton";

interface HomeHeaderProps {
  style?: ViewStyle;
}

export default function HomeHeader({ style }: HomeHeaderProps) {
  const router = useRouter();
  const user = useSelector(selectCurrentUser);

  return (
    <View style={[styles.container, style]}>
      <Image
        source={require("../../assets/images/Clipzo.png")}
        style={styles.logo}
        contentFit="contain"
      />
      <View style={styles.rightSection}>
        <UpgradeButton />
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/settings")}
          style={styles.profileButton}
        >
          <View style={styles.avatarContainer}>
            {user?.profilePicture ? (
              <Image source={{ uri: user.profilePicture }} style={styles.avatar} />
            ) : (
              <FontAwesome5 name="user-alt" size={16} color={Colors.dark.text} />
            )}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    width: "100%",
    zIndex: 10,
  },
  logo: {
    width: 100,
    height: 35,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileButton: {
    marginLeft: 12,
  },
  avatarContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: 19,
  },
});
