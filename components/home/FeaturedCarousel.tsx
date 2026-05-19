import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Template } from "../../constants/Templates";
import PrimaryButton from "../common/PrimaryButton";
import { Skeleton } from "../common/Skeleton";

const { width } = Dimensions.get("window");
const CAROUSEL_WIDTH = width - 35;
const CAROUSEL_HEIGHT = 165;

interface FeaturedCarouselProps {
  data?: Template[];
  isLoading?: boolean;
}

export default function FeaturedCarousel({
  data,
  isLoading,
}: FeaturedCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  const displayData = data || [];
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Skeleton width="100%" height="100%" borderRadius={20} />
        </View>
      </View>
    );
  }

  if (displayData.length === 0) {
    return null;
  }

  const handlePress = (template: Template) => {
    router.push({
      pathname: "/template-upload",
      params: {
        id: template.id,
        title: template.title,
        image: template.image,
        inputType: template.inputType,
        inputCount: template.inputCount.toString(),
        prompt: template.prompt,
        templateType: template.templateType,
        categoryId: template.categoryId || "",
      },
    });
  };

  const renderItem = ({ item }: { item: Template }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.9} 
      onPress={() => handlePress(item)}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        contentFit="cover"
        transition={300}
        cachePolicy="memory-disk"
      />
      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.6)"]}
        style={styles.gradient}
      />
      <View style={styles.content}>
        <PrimaryButton 
          title="USE" 
          onPress={() => handlePress(item)} 
          colors={item.templateType === "image" ? ["#002375", "#0047ED"] : ["#820036", "#FF006A"]}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={displayData}
        renderItem={renderItem}
        horizontal
        pagingEnabled={false}
        snapToInterval={CAROUSEL_WIDTH}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        // style={{ backgroundColor: "#000000" }}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / CAROUSEL_WIDTH);
          setActiveIndex(index);
        }}
        keyExtractor={(item) => item.id}
      />
      {/* Pagination dots hidden for now as per user request */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: CAROUSEL_HEIGHT,
    width: CAROUSEL_WIDTH,
    // backgroundColor: "#000000",
  },
  card: {
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_HEIGHT,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#000000",
  },
  image: {
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_HEIGHT,
    position: "absolute",
    backgroundColor: "#000000",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "60%",
  },
  content: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
});
