import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  Dimensions,
  FlatList,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../components/common/ScreenHeader";
import Colors from "../constants/Colors";
import { useGetPlansQuery, useGetTopTemplatesQuery } from "../store/api/apiSlice";
import { useIAPFlow } from "../hooks/useIAP";
import Toast from "react-native-toast-message";
import { Skeleton } from "../components/common/Skeleton";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 50) / 2;

export default function SubscriptionScreen() {
  const router = useRouter();
  const { data: plans, isLoading: isLoadingPlans } = useGetPlansQuery();
  const { data: topTemplates, isLoading: isLoadingTop } = useGetTopTemplatesQuery({ limit: 5 });
  const { handlePurchase } = useIAPFlow();
  
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (plans && plans.length > 0 && !selectedPlanId) {
      setSelectedPlanId(plans[0].id);
    }
  }, [plans]);

  const selectedPlan = plans?.find(p => p.id === selectedPlanId);

  const onPurchase = async () => {
    if (!selectedPlan) {
      Toast.show({
        type: "error",
        text1: "No Plan Selected",
        text2: "Please select a plan to continue.",
      });
      return;
    }
    try {
      await handlePurchase(selectedPlan.playStorePlanId);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Purchase Error",
        text2: "Failed to initiate purchase. Please try again.",
      });
    }
  };

  const renderPlanItem = ({ item }: { item: any }) => {
    const isSelected = selectedPlanId === item.id;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setSelectedPlanId(item.id)}
        style={styles.planCardWrapper}
      >
        {isSelected ? (
          <LinearGradient
            colors={["#0044E0", "#F20165"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.selectedBorderGradient}
          >
            <View style={styles.planCardInner}>
              <Text style={styles.planPrice}>₹{item.amount}</Text>
              <Text style={styles.planCredits}>{item.credits} credit</Text>
            </View>
          </LinearGradient>
        ) : (
          <View style={styles.planCardInactive}>
            <Text style={styles.planPrice}>₹{item.amount}</Text>
            <Text style={styles.planCredits}>{item.credits} credit</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderSliderItem = ({ item }: { item: any }) => (
    <View style={styles.sliderImageWrapper}>
      <Image source={{ uri: item.image }} style={styles.sliderImage} resizeMode="cover" />
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.dark.gradientStart, Colors.dark.gradientEnd]}
        style={styles.background}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <ScreenHeader title="Subscription" />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Top Slider */}
          <View style={styles.sliderContainer}>
            <FlatList
              data={topTemplates}
              renderItem={renderSliderItem}
              horizontal
              pagingEnabled
              snapToInterval={width * 0.6 + 20}
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.sliderList}
              keyExtractor={(item) => item.id}
            />
          </View>

          {/* Feature List */}
          <View style={styles.featuresContainer}>
            {(selectedPlan?.bulletPoints || [
              "Create viral AI Videos from your Photos",
              "Swap your face in your dream look",
              "Make your photos move like magic",
              "Get 5 credits FREE"
            ]).map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Ionicons name="checkmark" size={18} color="#FFF" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* Plans Grid */}
          <View style={styles.plansGridContainer}>
            {isLoadingPlans ? (
              <View style={styles.skeletonGrid}>
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} width={ITEM_WIDTH} height={100} borderRadius={16} />
                ))}
              </View>
            ) : (
              <FlatList
                data={plans}
                renderItem={renderPlanItem}
                numColumns={2}
                scrollEnabled={false}
                keyExtractor={(item) => item.id}
                columnWrapperStyle={styles.plansRow}
              />
            )}
          </View>
        </ScrollView>

        {/* Purchase Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            activeOpacity={0.9} 
            onPress={onPurchase}
            style={styles.purchaseBtnWrapper}
          >
            <LinearGradient
              colors={["#0044E0", "#F20165"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.purchaseBtn}
            >
              <Text style={styles.purchaseBtnText}>Purchase</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  sliderContainer: {
    height: 280,
    marginTop: 10,
  },
  sliderList: {
    paddingHorizontal: 20,
    gap: 20,
  },
  sliderImageWrapper: {
    width: width * 0.6,
    height: 260,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  sliderImage: {
    width: "100%",
    height: "100%",
  },
  featuresContainer: {
    paddingHorizontal: 25,
    marginTop: 10,
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  featureText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
    opacity: 0.9,
  },
  plansGridContainer: {
    paddingHorizontal: 20,
    marginTop: 30,
  },
  plansRow: {
    justifyContent: "space-between",
    marginBottom: 15,
  },
  planCardWrapper: {
    width: ITEM_WIDTH,
    height: 100,
    borderRadius: 16,
    overflow: "hidden",
  },
  selectedBorderGradient: {
    flex: 1,
    padding: 2, // Border thickness
  },
  planCardInner: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  planCardInactive: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  planPrice: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  planCredits: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    marginTop: 4,
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 15,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  purchaseBtnWrapper: {
    height: 52,
    borderRadius: 26,
    overflow: "hidden",
  },
  purchaseBtn: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  purchaseBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
