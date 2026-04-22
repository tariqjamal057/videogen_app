import React from "react";
import {
  ActivityIndicator,
  Image,
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
            <Image
              source={{
                uri: "https://img.icons8.com/color/48/000000/google-logo.png",
              }}
              style={styles.googleIcon}
            />
          </View>
          <Text style={styles.buttonText}>Login with Google</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.dark.white,
    // height: 56,
    borderRadius: 28,
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 8,
    shadowColor: Colors.dark.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
    marginBottom: 7,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  googleIcon: {
    width: 22,
    height: 22,
  },
  buttonText: {
    color: Colors.dark.black,
    fontSize: 12.5,
    fontFamily: "Molengo",
    fontWeight: "400",
    lineHeight: 15,
    letterSpacing: 0,
    marginLeft: 10,
  },
});
