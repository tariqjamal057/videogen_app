import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { Skeleton } from "../../components/common/Skeleton";
import FeaturedCarousel from "../../components/home/FeaturedCarousel";
import HomeHeader from "../../components/home/HomeHeader";
import TemplateSection from "../../components/home/TemplateSection";
import Colors from "../../constants/Colors";
import {
  useGetTemplatesByCategoryQuery,
  useGetTopTemplatesQuery,
} from "../../store/api/apiSlice";

const CategorySkeleton = () => (
  <View style={{ marginBottom: 20 }}>
    <Skeleton
      width={150}
      height={22}
      style={{ marginLeft: 20, marginBottom: 15 }}
    />
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 15 }}
    >
      {[1, 2, 3].map((i) => (
        <Skeleton
          key={i}
          width={160}
          height={220}
          borderRadius={14}
          style={{ marginHorizontal: 5 }}
        />
      ))}
    </ScrollView>
  </View>
);

export default function DiscoverScreen() {
  const { data: categories, isLoading: isLoadingCategories } =
    useGetTemplatesByCategoryQuery();
  const { data: topTemplates, isLoading: isLoadingTop } =
    useGetTopTemplatesQuery();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.dark.gradientStart, Colors.dark.gradientEnd]}
        style={styles.background}
      />

      <View style={styles.fixedHeaderContainer}>
        <FeaturedCarousel data={topTemplates} isLoading={isLoadingTop} />
        <HomeHeader style={styles.absoluteHeader} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {isLoadingCategories ? (
          <View>
            <CategorySkeleton />
            <CategorySkeleton />
          </View>
        ) : (
          categories?.map((category) => (
            <TemplateSection
              key={category.id}
              title={category.title}
              templates={category.templates}
            />
          ))
        )}
      </ScrollView>
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
  fixedHeaderContainer: {
    width: "100%",
  },
  absoluteHeader: {
    position: "absolute",
    top: 0,
    backgroundColor: "transparent",
  },
  scrollContent: {
    flexGrow: 1,
    marginTop: 10,
  },
});
