import CloseButton from "@/components/common/CloseButton";
import GradientButton from "@/components/common/GradientButton";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Skeleton } from "../components/common/Skeleton";
import Colors from "../constants/Colors";
import { Links } from "../constants/Links";
import { useIAPFlow } from "../hooks/useIAP";
import { CAROUSEL_VIDEOS, getCachedVideoUri } from "../lib/videoCache";
import { useGetPlansQuery } from "../store/api/apiSlice";

const CarouselVideoItem = React.memo(
  ({
    url,
    style,
    index,
    activeIndex,
  }: {
    url: string;
    style: any;
    index: number;
    activeIndex: number;
  }) => {
    const isVisible = index === activeIndex;
    const player = useVideoPlayer(url, (p) => {
      p.loop = true;
      p.muted = true;
      p.volume = 0;
    });

    const isMounted = useRef(true);

    useEffect(() => {
      isMounted.current = true;
      (async () => {
        try {
          const cached = await getCachedVideoUri(url);
          if (isMounted.current && cached !== url) {
            player.replace(cached);
          }
        } catch (e) {}
      })();

      return () => {
        isMounted.current = false;
      };
    }, [url, player]);

    useEffect(() => {
      if (!isMounted.current) return;
      try {
        if (isVisible) {
          player.play();
        } else {
          player.pause();
        }
      } catch (e) {}
    }, [isVisible, player]);

    return (
      <View style={style.carouselItem}>
        <VideoView
          player={player}
          style={style.carouselImage}
          contentFit="cover"
          nativeControls={false}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
        />
      </View>
    );
  }
);

export default function PlansScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: plans, isLoading } = useGetPlansQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const ITEM_WIDTH = width * 0.55;
  const GAP = 12;
  const DATA = useMemo(() => CAROUSEL_VIDEOS, []);

  const styles = useMemo(
    () => getStyles(width, height, ITEM_WIDTH, GAP),
    [width, height, ITEM_WIDTH, GAP]
  );

  const { handlePurchase, fetchPlanProducts } = useIAPFlow();

  useEffect(() => {
    if (plans && plans.length > 0) {
      if (!selectedId) {
        const bestValuePlan = plans.find((p) => p.bestValue) || plans[0];
        setSelectedId(bestValuePlan.playStorePlanId);
      }
      fetchPlanProducts(plans.map((p) => p.playStorePlanId));
    }
  }, [plans]);

  const onPurchase = async () => {
    if (!selectedId) return;
    try {
      await handlePurchase(selectedId);
    } catch {
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
        <View style={styles.safeArea}>
          <View style={styles.contentContainer}>
            <View
              style={[styles.carouselContainer, { paddingTop: insets.top }]}
            >
              <View style={styles.skeletonContainer}>
                <Skeleton width={ITEM_WIDTH} height="90%" borderRadius={16} />
              </View>
              <CloseButton
                onPress={() => router.back()}
                style={[styles.closeButton, { top: insets.top + 20 }]}
                variant="dark"
                size={30}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }

  const selectedPlan =
    plans?.find((p) => p.playStorePlanId === selectedId) || plans?.[0];
  if (!selectedPlan) return null;

  return (
    <View style={styles.container}>
      {/* <LinearGradient
        colors={[Colors.dark.gradientStart, Colors.dark.gradientEnd]}
        style={styles.background}
      /> */}

      <View style={styles.safeArea}>
        <View style={styles.contentContainer}>
          <View style={[styles.carouselContainer, { paddingTop: insets.top }]}>
            <Carousel
              loop
              width={ITEM_WIDTH + GAP}
              height={height * 0.4}
              autoPlay={true}
              autoPlayInterval={2500}
              data={DATA}
              scrollAnimationDuration={1000}
              onSnapToItem={(index) => setActiveIndex(index)}
              style={{
                width: width,
                justifyContent: "center",
                alignItems: "center",
              }}
              renderItem={({ item, index }) => (
                <CarouselVideoItem
                  url={item}
                  style={styles}
                  index={index}
                  activeIndex={activeIndex}
                />
              )}
            />

            <CloseButton
              onPress={() => router.back()}
              style={[styles.closeButton, { top: insets.top + 20 }]}
              variant="dark"
              size={30}
            />
          </View>

          <View style={styles.content}>
            <View style={styles.featureList}>
              {selectedPlan.bulletPoints.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={Colors.dark.white}
                  />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>

            <View style={styles.plansContainer}>
              {plans?.map((plan) => (
                <TouchableOpacity
                  key={plan.playStorePlanId}
                  style={[
                    styles.planCard,
                    selectedId === plan.playStorePlanId &&
                      styles.selectedPlanCard,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setSelectedId(plan.playStorePlanId)}
                >
                  <View style={styles.planInfo}>
                    <View style={styles.planNameRow}>
                      <Text style={styles.planName}>{plan.name}</Text>
                      {(plan.mostPopular || plan.bestValue) && (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>
                            {plan.mostPopular
                              ? "POPULAR"
                              : plan.bestValue
                              ? "BEST VALUE"
                              : ""}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.planSubtext}>
                      {plan.credits} Credits
                    </Text>
                  </View>

                  <View style={styles.planPriceInfo}>
                    <Text style={styles.planPrice}>₹{plan.amount}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={[styles.stickyFooter, { paddingBottom: insets.bottom }]}>
          <GradientButton title="Purchase" onPress={onPurchase} />
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

const getStyles = (
  width: number,
  height: number,
  ITEM_WIDTH: number,
  GAP: number
) =>
  StyleSheet.create({
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
    safeArea: {
      flex: 1,
    },
    contentContainer: {
      flex: 1,
    },
    carouselContainer: {
      height: height * 0.45,
      width: "100%",
      position: "relative",
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
    },
    skeletonContainer: {
      width: ITEM_WIDTH,
      height: "90%",
      borderRadius: 16,
      overflow: "hidden",
    },
    carouselItem: {
      width: ITEM_WIDTH,
      height: "90%",
      alignSelf: "center",
      borderRadius: 16,
      overflow: "hidden",
    },
    carouselImage: {
      width: "100%",
      height: "100%",
      backgroundColor: Colors.dark.surface,
      borderRadius: 16,
    },
    closeButton: {
      position: "absolute",
      top: 40,
      right: 20,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      justifyContent: "space-around",
    },
    stickyFooter: {
      paddingHorizontal: 20,
      paddingTop: 16,
      backgroundColor: Colors.dark.background,
      borderTopWidth: 1,
      borderTopColor: Colors.dark.whiteTranslucentVeryLow,
    },
    featureList: {
      marginTop: 10,
    },
    featureItem: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    featureText: {
      fontSize: 14,
      color: Colors.dark.textMuted,
      marginLeft: 6,
      fontWeight: "400",
    },
    plansContainer: {
      gap: 16,
    },
    planCard: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 6,
      paddingHorizontal: 20,
      borderRadius: 40,
      borderWidth: 0.5,
      borderColor: Colors.dark.border,
      backgroundColor: Colors.dark.surface,
    },
    selectedPlanCard: {
      borderColor: Colors.dark.primary,
      borderWidth: 0.5,
      backgroundColor: "rgba(139, 92, 246, 0.1)",
    },
    planInfo: {
      flex: 1,
    },
    planNameRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 2,
    },
    planName: {
      fontSize: 14,
      fontWeight: "500",
      color: Colors.dark.text,
    },
    discountBadge: {
      backgroundColor: Colors.dark.primary,
      paddingHorizontal: 6,
      paddingVertical: 1,
      borderRadius: 10,
      marginLeft: 6,
    },
    discountText: {
      color: Colors.dark.white,
      fontSize: 8,
      fontWeight: "500",
    },

    planSubtext: {
      fontSize: 12,
      color: Colors.dark.textDim,
      fontWeight: "500",
    },
    planPriceInfo: {
      alignItems: "flex-end",
    },
    planPrice: {
      fontSize: 16,
      fontWeight: "600",
      color: Colors.dark.text,
    },
    footer: {
      alignItems: "center",
      marginVertical: 5,
    },
    footerLinks: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
    },
    footerLink: {
      fontSize: 11,
      color: Colors.dark.textMuted,
      fontWeight: "600",
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
