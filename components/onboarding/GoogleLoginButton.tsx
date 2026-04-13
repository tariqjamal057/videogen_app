import FontAwesome from "@expo/vector-icons/FontAwesome";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../constants/Colors";

interface GoogleLoginButtonProps {
  onPress: () => void;
  isLoading?: boolean;
}

export const GoogleLoginButton = ({
  onPress,
  isLoading,
}: GoogleLoginButtonProps) => {
  return (
    <TouchableOpacity
      style={styles.googleButton}
      onPress={onPress}
      activeOpacity={0.9}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color={Colors.dark.gray} style={{ flex: 1 }} />
      ) : (
        <>
          <View style={styles.googleIconContainer}>
            <FontAwesome name="google" size={20} color="#4285F4" />
          </View>
          <Text style={styles.buttonText}>Continue with Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.dark.white,
    height: 56,
    borderRadius: 16,
    width: "100%",
    paddingHorizontal: 12,
    shadowColor: Colors.dark.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  googleIconContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: Colors.dark.gray,
    fontSize: 17,
    fontWeight: "500",
    flex: 1,
    textAlign: "center",
  },
});
