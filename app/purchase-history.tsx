import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../components/common/ScreenHeader";
import Colors from "../constants/Colors";

import { ActivityIndicator, RefreshControl } from "react-native";
import { useGetPurchaseHistoryQuery } from "../store/api/apiSlice";

export default function PurchaseHistoryScreen() {
  const {
    data: transactions,
    isLoading,
    refetch,
    isFetching,
  } = useGetPurchaseHistoryQuery();

  const getStatusInfo = (status: number) => {
    switch (status) {
      case 2:
        return { text: "Success", color: Colors.dark.success };
      case 3:
        return { text: "Failed", color: Colors.dark.error };
      default:
        return { text: "Pending", color: Colors.dark.warning };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderItem = ({ item }: { item: any }) => {
    const statusInfo = getStatusInfo(item.status);
    return (
      <View style={styles.recordCard}>
        <View style={styles.cardHeader}>
          <View style={styles.idContainer}>
            <Text style={styles.orderLabel}>TRANSACTION ID</Text>
            <Text style={styles.transactionId}>{item.transactionId}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${statusInfo.color}15` },
            ]}
          >
            <View
              style={[styles.statusDot, { backgroundColor: statusInfo.color }]}
            />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.cardBody}>
          <View style={styles.iconBox}>
            <MaterialIcons
              name="auto-awesome"
              size={16}
              color={Colors.dark.primary}
            />
          </View>
          <View style={styles.mainInfo}>
            <Text style={styles.creditsTitle}>{item.credits} Credits</Text>
            <Text style={styles.dateTimeText}>
              {formatDate(item.createdAt)} • {formatTime(item.createdAt)}
            </Text>
          </View>
          <View style={styles.priceInfo}>
            <Text style={styles.priceText}>₹{item.amount.toFixed(2)}</Text>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <ScreenHeader title="Purchase History" />
        <View style={[styles.emptyState, { marginTop: "50%" }]}>
          <ActivityIndicator size="large" color={Colors.dark.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScreenHeader title="Purchase History" />

      <FlatList
        data={transactions}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={refetch}
            tintColor={Colors.dark.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <MaterialIcons
                name="history"
                size={48}
                color={Colors.dark.whiteTranslucent}
              />
            </View>
            <Text style={styles.emptyTitle}>No purchases found</Text>
            <Text style={styles.emptySubtitle}>
              Your credit purchase records will appear here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark.white,
  },
  listContent: {
    padding: 20,
    paddingTop: 10,
    gap: 16,
  },
  recordCard: {
    backgroundColor: Colors.dark.whiteTranslucentVeryLow,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.dark.whiteTranslucentLow,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
  },
  idContainer: {
    flex: 1,
  },
  orderLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: Colors.dark.textDim,
    letterSpacing: 1,
  },
  transactionId: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 8,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 16,
  },
  cardBody: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  mainInfo: {
    flex: 1,
    marginLeft: 14,
  },
  creditsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.white,
  },
  methodText: {
    fontSize: 12,
    color: Colors.dark.textDim,
    marginTop: 2,
  },
  priceInfo: {
    alignItems: "flex-end",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.dark.white,
  },
  dateTimeText: {
    fontSize: 11,
    color: Colors.dark.textDim,
    marginTop: 2,
  },
  cardFooter: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  timeLabel: {
    fontSize: 10,
    color: Colors.dark.textDim,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.02)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark.white,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.dark.textDim,
    textAlign: "center",
    lineHeight: 20,
  },
});
