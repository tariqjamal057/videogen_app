import { MaterialIcons, Feather } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../components/common/ScreenHeader";
import Colors from "../constants/Colors";
import { useGetPurchaseHistoryQuery } from "../store/api/apiSlice";

export default function TransactionHistoryScreen() {
  const {
    data: transactions,
    isLoading,
    refetch,
    isFetching,
  } = useGetPurchaseHistoryQuery();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const renderItem = ({ item }: { item: any }) => {
    const isPurchase = item.type === "purchase";
    const iconColor = isPurchase ? "#22C55E" : "#EF4444";
    const iconBgColor = isPurchase
      ? "rgba(34, 197, 94, 0.1)"
      : "rgba(239, 68, 68, 0.1)";

    return (
      <View style={styles.transactionRow}>
        <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
          <MaterialIcons name="north-east" size={20} color={iconColor} />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
          <Text style={styles.creditsText}>{item.credits} credits</Text>
        </View>

        <View style={styles.rightContainer}>
          {isPurchase ? (
            <Text style={styles.amountText}>₹{item.amount}</Text>
          ) : (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.usageType}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScreenHeader title="Transaction History" />

        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={Colors.dark.primary} />
          </View>
        ) : (
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
              <View style={styles.centerContainer}>
                <Feather name="list" size={48} color="rgba(255,255,255,0.1)" />
                <Text style={styles.emptyText}>No history found</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  transactionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 15,
  },
  dateText: {
    fontSize: 11,
    fontFamily: "Molengo",
    fontWeight: "400",
    color: "#d0d0d0",
    marginBottom: 2,
  },
  creditsText: {
    fontSize: 16,
    fontFamily: "Molengo",
    fontWeight: "400",
    color: "#fff",
  },
  rightContainer: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 20,
    fontFamily: "Molengo",
    fontWeight: "400",
    color: "#fff",
  },
  badge: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  badgeText: {
    fontSize: 11,
    fontFamily: "Molengo",
    fontWeight: "400",
    color: "#fff",
  },
  emptyText: {
    marginTop: 15,
    fontSize: 15,
    fontFamily: "Molengo",
    fontWeight: "400",
    color: "#d0d0d0",
  },
});
