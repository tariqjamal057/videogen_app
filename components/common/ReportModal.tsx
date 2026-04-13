import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Colors from "../../constants/Colors";
import { useReportVideoMutation } from "../../store/api/apiSlice";

interface ReportModalProps {
  isVisible: boolean;
  onClose: () => void;
  videoId: string;
}

const REPORT_REASONS = [
  "Offensive",
  "Sexual content",
  "Violence",
  "Hate / Harassment",
  "Other",
];

export function ReportModal({ isVisible, onClose, videoId }: ReportModalProps) {
  const insets = useSafeAreaInsets();
  const [reportVideo, { isLoading }] = useReportVideoMutation();

  const handleReport = async (reason: string) => {
    try {
      if (!videoId) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Video ID is missing",
        });
        return;
      }

      await reportVideo({ videoId, reason }).unwrap();

      Toast.show({
        type: "success",
        text1: "Report Submitted",
        text2: "Thank you for reporting. Our team will review it.",
      });
      onClose();
    } catch (error: any) {
      console.error("Report error:", error);
      if (error.status === 400) {
        onClose()
      }
      Toast.show({
          type: "error",
          text1: "Submission Failed",
          text2: "Could not submit report. Please try again later.",
      });
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.content,
                { paddingBottom: Math.max(insets.bottom, 20) },
              ]}
            >
              <View style={styles.header}>
                <View style={styles.handle} />
                <Text style={styles.title}>Report this creation</Text>
                <Text style={styles.subtitle}>
                  Why are you reporting this content?
                </Text>
              </View>

              <View style={styles.reasonsList}>
                {REPORT_REASONS.map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={styles.reasonItem}
                    activeOpacity={0.7}
                    onPress={() => handleReport(reason)}
                    disabled={isLoading}
                  >
                    <Text style={styles.reasonText}>{reason}</Text>
                    {isLoading ? (
                      <ActivityIndicator
                        size="small"
                        color={Colors.dark.textMuted}
                      />
                    ) : (
                      <MaterialIcons
                        name="chevron-right"
                        size={24}
                        color={Colors.dark.textMuted}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.7}
                onPress={onClose}
                disabled={isLoading}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: Colors.dark.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.dark.whiteTranslucentLow,
    borderRadius: 2,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.dark.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.textMuted,
  },
  reasonsList: {
    marginBottom: 16,
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.whiteTranslucentLow,
  },
  reasonText: {
    fontSize: 16,
    color: Colors.dark.white,
    fontWeight: "500",
  },
  cancelButton: {
    marginTop: 8,
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 16,
    backgroundColor: Colors.dark.whiteTranslucentLow,
    marginBottom: 10,
  },
  cancelText: {
    fontSize: 16,
    color: Colors.dark.white,
    fontWeight: "600",
  },
});
