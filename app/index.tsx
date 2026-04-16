import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "../components/common/PrimaryButton";
import { Skeleton } from "../components/common/Skeleton";
import FeaturedCarousel from "../components/home/FeaturedCarousel";
import HomeHeader from "../components/home/HomeHeader";
import TemplateSection from "../components/home/TemplateSection";
import Colors from "../constants/Colors";
import { Template } from "../constants/Templates";
import {
  useGetTemplatesByCategoryQuery,
  useGetTopTemplatesQuery,
} from "../store/api/apiSlice";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const GRID_SPACING = 10;
const ITEM_WIDTH = (width - 30 - (GRID_SPACING * (COLUMN_COUNT - 1))) / COLUMN_COUNT;

const CategorySkeleton = () => (
  <View style={{ marginBottom: 20 }}>
    <Skeleton
      width={150}
      height={22}
      style={{ marginLeft: 20, marginBottom: 15 }}
    />
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        paddingHorizontal: 20,
        justifyContent: "space-between",
      }}
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton
          key={i}
          width={ITEM_WIDTH}
          height={160}
          borderRadius={14}
          style={{ marginBottom: 15 }}
        />
      ))}
    </View>
  </View>
);

const ListHeader = React.memo(({ 
  topTemplates, 
  isLoadingTop, 
  activeTab, 
  setActiveTab 
}: { 
  topTemplates: Template[] | undefined, 
  isLoadingTop: boolean,
  activeTab: "video" | "image",
  setActiveTab: (tab: "video" | "image") => void
}) => (
  <View>
    <View style={styles.carouselContainer}>
      <FeaturedCarousel data={topTemplates} isLoading={isLoadingTop} />
    </View>

    <View style={styles.trendingSection}>
      <TemplateSection
        title="Trending Templates"
        templates={topTemplates || []}
        onSeeAll={() => {}}
      />
    </View>

    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => setActiveTab("video")}
        activeOpacity={1}
      >
        {activeTab === "video" ? (
          <LinearGradient
            colors={["#444", "#000"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.tabGradient, styles.activeTabBorder]}
          >
            <Text style={styles.activeTabText}>Video Templates</Text>
          </LinearGradient>
        ) : (
          <View style={styles.inactiveTab}>
            <Text style={styles.inactiveTabText}>Video Templates</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => setActiveTab("image")}
        activeOpacity={1}
      >
        {activeTab === "image" ? (
          <LinearGradient
            colors={["#444", "#000"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.tabGradient, styles.activeTabBorder]}
          >
            <Text style={styles.activeTabText}>Image Templates</Text>
          </LinearGradient>
        ) : (
          <View style={styles.inactiveTab}>
            <Text style={styles.inactiveTabText}>Image Templates</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  </View>
));

export default function DiscoverScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"video" | "image">("video");
  const { data: categories, isLoading: isLoadingCategories } =
    useGetTemplatesByCategoryQuery();
  const { data: topTemplates, isLoading: isLoadingTop } =
    useGetTopTemplatesQuery();

  const filteredTemplates = useMemo(() => {
    if (!categories) return [];

    const relevantCategories = categories.filter((cat) => {
      const isImageCat = cat.title.toLowerCase().includes("image");
      return activeTab === "image" ? isImageCat : !isImageCat;
    });

    const allTemplates = relevantCategories.flatMap((cat) => cat.templates);
    return Array.from(new Map(allTemplates.map((t) => [t.id, t])).values());
  }, [categories, activeTab]);

  const handleTemplatePress = (template: Template) => {
    router.push({
      pathname: "/template-detail",
      params: {
        id: template.id,
        title: template.title,
        description: template.description,
        image: template.image,
        inputType: template.inputType,
        inputCount: template.inputCount.toString(),
        prompt: template.prompt,
      },
    });
  };

  const renderTemplateItem = ({ item }: { item: Template }) => (
    <TouchableOpacity
      style={styles.gridCard}
      activeOpacity={0.8}
      onPress={() => handleTemplatePress(item)}
    >
      <Image
        source={require("../assets/images/transparent-icon.png")}
        style={[StyleSheet.absoluteFill, { opacity: 0.2 }]}
        contentFit="contain"
      />
      <Image
        source={{ uri: item.image }}
        style={styles.gridImage}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        style={styles.gridGradient}
        locations={[0.6, 1]}
      />
      <View style={styles.gridButtonContainer}>
        <PrimaryButton 
          title="USE" 
          onPress={() => handleTemplatePress(item)}
          style={styles.useButton}
          textStyle={styles.useButtonText}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.dark.gradientStart, Colors.dark.gradientEnd]}
        style={styles.background}
      />

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <HomeHeader />

        <FlatList
          data={filteredTemplates}
          renderItem={renderTemplateItem}
          keyExtractor={(item) => item.id}
          numColumns={COLUMN_COUNT}
          ListHeaderComponent={
            <ListHeader 
              topTemplates={topTemplates}
              isLoadingTop={isLoadingTop}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          }
          contentContainerStyle={[styles.listContent]}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            isLoadingCategories ? (
              <CategorySkeleton />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No templates found</Text>
              </View>
            )
          }
        />

        <View style={styles.floatingFooter}>
          <TouchableOpacity
            style={styles.footerButton}
            activeOpacity={0.9}
            onPress={() => {}}
          >
            <LinearGradient
              colors={["#002375", "#0047ED"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.footerGradient}
            >
              <Text style={styles.footerButtonText}>Generate a Image</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.footerButton}
            activeOpacity={0.9}
            onPress={() => {}}
          >
            <LinearGradient
              colors={["#820036", "#FF006A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.footerGradient}
            >
              <Text style={styles.footerButtonText}>Generate a Video</Text>
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
    backgroundColor: Colors.dark.background,
  },
  background: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  carouselContainer: {
    width: "100%",
    paddingHorizontal: 15,
    marginTop: 10,
    backgroundColor: "transparent",
  },
  trendingSection: {
    marginTop: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    width: "100%",
    height: 50,
    marginTop: 10,
    marginBottom: 20,
  },
  tabItem: {
    flex: 1,
  },
  tabGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  activeTabBorder: {
    borderBottomWidth: 2,
    borderBottomColor: "#FFFFFF",
  },
  inactiveTab: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  activeTabText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  inactiveTabText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    fontWeight: "600",
  },
  listContent: {
    // paddingBottom handled inline
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  gridCard: {
    width: ITEM_WIDTH,
    height: 160,
    borderRadius: 14,
    marginBottom: 15,
    overflow: "hidden",
    backgroundColor: Colors.dark.surface,
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  gridGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
  gridButtonContainer: {
    position: "absolute",
    bottom: 4,
    right: -2,
  },
  useButton: {
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  useButtonText: {
    fontSize: 8,
    // lineHeight: 14,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    color: Colors.dark.textMuted,
    fontSize: 16,
  },
  floatingFooter: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "transparent",
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 5,
    // height: 50,
    borderRadius: 25,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  footerGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  footerButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
});
