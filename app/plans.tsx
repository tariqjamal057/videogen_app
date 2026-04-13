import CloseButton from "@/components/common/CloseButton";
import GradientButton from "@/components/common/GradientButton";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Dimensions,
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PurchaseImage from "../assets/images/purchase.jpg";
import { Skeleton } from "../components/common/Skeleton";
import Colors from "../constants/Colors";
import { Links } from "../constants/Links";
import { useIAPFlow } from "../hooks/useIAP";
import { useGetPlansQuery } from "../store/api/apiSlice";

const { width, height } = Dimensions.get("window");

import Toast from "react-native-toast-message";

export default function BestValueScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: plans, isLoading } = useGetPlansQuery();
  const { handlePurchase } = useIAPFlow();

  const plan = plans?.[0];
  const onPurchase = async () => {
    if (!plan) return;
    try {
      await handlePurchase(plan.playStorePlanId);
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Purchase Error",
        text2: "Failed to initiate purchase. Please try again.",
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={[Colors.dark.gradientStart, Colors.dark.gradientEnd]}
          style={styles.background}
        />
        <View style={styles.imageContainer}>
          <Skeleton width="100%" height="100%" borderRadius={0} />
        </View>
        <View
          style={[
            styles.contentContainer,
            { paddingBottom: insets.bottom || 24 },
          ]}
        >
          <View style={styles.textSection}>
            <View style={styles.featureList}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.featureItem}>
                  <Skeleton width={20} height={20} borderRadius={10} />
                  <Skeleton
                    width={200}
                    height={16}
                    borderRadius={8}
                    style={{ marginLeft: 10 }}
                  />
                </View>
              ))}
            </View>
            <View style={styles.priceContainer}>
              <View style={styles.priceRow}>
                <Skeleton width={120} height={32} borderRadius={16} />
              </View>
            </View>
          </View>
          <View style={styles.buttonSection}>
            <Skeleton width="100%" height={56} borderRadius={28} />
            <View style={{ height: 20 }} />
          </View>
        </View>
      </View>
    );
  }

  if (!plan) return null;

  const features = plan.bulletPoints;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.dark.gradientStart, Colors.dark.gradientEnd]}
      />

      <View style={styles.imageContainer}>
        <Image source={PurchaseImage} style={styles.image} />
        <LinearGradient
          colors={[
            "transparent",
            "rgba(0,0,0,0.2)",
            "rgba(0,0,0,0.7)",
            Colors.dark.background,
          ]}
          style={styles.imageGradient}
        />
        <CloseButton
          onPress={() => router.back()}
          style={styles.closeButton}
          variant="dark"
          size={30}
        />
      </View>

      <View
        style={[
          styles.contentContainer,
          { paddingBottom: insets.bottom || 24 },
        ]}
      >
        <View style={styles.textSection}>
          <View style={styles.featureList}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={Colors.dark.white}
                />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.priceAmount}>₹{plan.amount}</Text>
              <Text style={styles.priceSlash}>/</Text>
              <Text style={styles.priceCredits}>{plan.credits} Credits</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonSection}>
          <GradientButton onPress={onPurchase} title="Purchase" />

          <TouchableOpacity
            style={styles.showAllButton}
            onPress={() => router.push("/all-plans")}
          >
            <Text style={styles.showAllText}>Show all plans</Text>
            <Ionicons
              name="caret-forward-outline"
              size={12}
              color={Colors.dark.textMuted}
              style={styles.arrowIcon}
            />
          </TouchableOpacity>

          <View style={styles.footer}>
            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => Linking.openURL(Links.terms)}>
                <Text style={styles.footerLink}>Terms</Text>
              </TouchableOpacity>
              <View style={styles.dot} />
              <TouchableOpacity onPress={() => Linking.openURL(Links.privacy)}>
                <Text style={styles.footerLink}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  imageContainer: {
    width: "100%",
    height: height * 0.6,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 150,
  },
  closeButton: {
    position: "absolute",
    top: 30,
    right: 20,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-around",
  },
  textSection: {
    alignItems: "center",
  },
  tagline: {
    color: Colors.dark.primary,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 2,
    marginBottom: 8,
  },
  featureList: {
    gap: 4,
    marginTop: 10,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureText: {
    fontSize: 12,
    color: Colors.dark.text,
    marginLeft: 6,
    fontWeight: "500",
  },
  priceContainer: {
    marginTop: 20,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.dark.white,
  },
  priceSlash: {
    fontSize: 20,
    color: Colors.dark.textMuted,
    fontWeight: "300",
  },
  priceCredits: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark.textMuted,
  },
  subPrice: {
    fontSize: 12,
    color: Colors.dark.primary,
    fontWeight: "600",
    marginTop: 4,
  },
  buttonSection: {
    gap: 10,
    paddingBottom: 4,
  },
  purchaseButton: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: Colors.dark.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  purchaseGradient: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  purchaseButtonText: {
    color: Colors.dark.white,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  showAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  showAllText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontWeight: "600",
  },
  arrowIcon: {
    marginLeft: 2,
    marginTop: 2,
  },
  footer: {
    alignItems: "center",
    marginTop: 15,
  },
  footerLinks: {
    flexDirection: "row",
    alignItems: "center",
  },
  footerLink: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.dark.textDim,
    marginHorizontal: 8,
  },
});
