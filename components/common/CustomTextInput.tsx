import React from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import Colors from "../../constants/Colors";

interface CustomTextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  height?: number;
  minLength?: number;
}

export const CustomTextInput = ({
  value,
  onChangeText,
  placeholder = "Please enter prompt",
  height = 180,
  minLength = 60,
}: CustomTextInputProps) => {
  const isMinLengthMet = value.trim().length >= minLength;

  return (
    <View style={[styles.inputContainer, { height }]}>
      {!value && <Text style={styles.placeholder}>{placeholder}</Text>}
      <TextInput
        style={styles.input}
        multiline
        value={value}
        onChangeText={onChangeText}
        selectionColor={Colors.dark.primary}
      />
      <Text
        style={[
          styles.charCount,
          isMinLengthMet && { color: Colors.dark.primary },
        ]}
      >
        {isMinLengthMet ? "✓" : `${value.trim().length}/${minLength}`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    backgroundColor: Colors.dark.whiteTranslucentLow,
    borderRadius: 24,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.dark.whiteTranslucent,
    position: "relative",
    width: "100%",
  },
  placeholder: {
    position: "absolute",
    top: 12,
    left: 15,
    fontSize: 16,
    color: Colors.dark.textMuted,
    zIndex: 1,
  },
  input: {
    fontSize: 16,
    color: Colors.dark.text,
    textAlignVertical: "top",
    height: "100%",
    zIndex: 2,
    paddingTop: 0,
    paddingBottom: 25,
  },
  charCount: {
    position: "absolute",
    bottom: 12,
    right: 15,
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontWeight: "600",
  },
});
