import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "../../constants/Colors";

import { Image } from "expo-image";

interface ProfileCardProps {
  name: string;
  email: string;
  profilePicture?: string;
}
export const ProfileCard = ({
  name,
  email,
  profilePicture,
}: ProfileCardProps) => {
  return (
    <View style={styles.profileCard}>
      <TouchableOpacity activeOpacity={0.8} style={styles.avatarContainer}>
        {profilePicture ? (
          <Image
            source={{ uri: profilePicture }}
            style={styles.avatar}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={200}
          />
        ) : (
          <LinearGradient
            colors={[Colors.dark.primary, Colors.dark.primaryDark]}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </LinearGradient>
        )}
        <View style={styles.onlineBadge} />
      </TouchableOpacity>
      <View style={styles.profileInfo}>
        <Text style={styles.profileName}>{name}</Text>
        <Text style={styles.profileEmail}>{email}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.whiteTranslucentVeryLow,
    padding: 12,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: Colors.dark.whiteTranslucentLow,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "600",
    color: Colors.dark.white,
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.dark.secondary,
    borderWidth: 2,
    borderColor: Colors.dark.gradientMiddle,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark.white,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.dark.icon,
    marginTop: 2,
  },
});
