import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "../../constants/Colors";

interface Plan {
  id: string;
  name: string;
  price: string;
  credits: string;
  description: string;
  color: readonly string[];
  isPopular: boolean;
}

interface PlanCardProps {
  plan: Plan;
  onBuyPress: (plan: Plan) => void;
}

export const PlanCard = ({ plan, onBuyPress }: PlanCardProps) => {
  return (
    <View style={styles.planCardContainer}>
      {plan.isPopular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>BEST VALUE</Text>
        </View>
      )}
      <LinearGradient
        colors={plan.color as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.planCard, plan.isPopular && styles.popularPlanCard]}
      >
        <View style={styles.planHeader}>
          <View>
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planCredits}>{plan.credits}</Text>
          </View>
          <Text style={styles.planPrice}>{plan.price}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.descriptionRow}>
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={Colors.dark.whiteTranslucent}
          />
          <Text style={styles.planDescription}>{plan.description}</Text>
        </View>

        <TouchableOpacity
          style={styles.buyButton}
          activeOpacity={0.8}
          onPress={() => onBuyPress(plan)}
        >
          <Text style={styles.buyButtonText}>Buy Now</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  planCardContainer: {
    marginBottom: 20,
    position: "relative",
  },
  planCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.dark.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  popularPlanCard: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  popularBadge: {
    position: "absolute",
    top: -12,
    right: 20,
    backgroundColor: Colors.dark.white,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1,
  },
  popularBadgeText: {
    color: Colors.dark.black,
    fontSize: 10,
    fontWeight: "700",
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  planName: {
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "600",
  },
  planCredits: {
    fontSize: 26,
    color: Colors.dark.white,
    fontWeight: "800",
    marginTop: 4,
  },
  planPrice: {
    fontSize: 24,
    color: Colors.dark.white,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.whiteTranslucent,
    marginVertical: 10,
  },
  descriptionRow: {
    flexDirection: "row",
    marginBottom: 16,
  },
  planDescription: {
    color: Colors.dark.text,
    fontSize: 15,
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  buyButton: {
    backgroundColor: Colors.dark.white,
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.dark.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  buyButtonText: {
    color: Colors.dark.black,
    fontSize: 16,
    fontWeight: "600",
  },
});
