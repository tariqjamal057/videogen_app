import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../constants/Colors";
import { Template } from "../../constants/Templates";
import { Skeleton } from "../common/Skeleton";

const { width, height } = Dimensions.get("window");

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
          <Skeleton width="100%" height="100%" borderRadius={0} />
          <View style={styles.content}>
            <Skeleton
              width={200}
              height={28}
              borderRadius={14}
              style={{ marginBottom: 12 }}
            />
            <Skeleton width={120} height={36} borderRadius={18} />
          </View>
        </View>
      </View>
    );
  }

  if (displayData.length === 0) {
    return null;
  }

  const handlePress = (template: Template) => {
    router.push({
      pathname: "/creation",
      params: {
        id: template.id,
        title: template.title,
        description: template.description,
        image: template.image,
        inputType: template.inputType,
        inputCount: template.inputCount.toString(),
      },
    });
  };

  const renderItem = ({ item }: { item: Template }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        contentFit="cover"
        transition={300}
        cachePolicy="memory-disk"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.1)", Colors.dark.background]}
        style={styles.gradient}
      />
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.8}
          onPress={() => handlePress(item)}
        >
          <Text style={styles.buttonText}>Try It Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={displayData}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setActiveIndex(index);
        }}
        keyExtractor={(item) => item.id}
      />
      <View style={styles.pagination}>
        {displayData.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, activeIndex === index && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: height * 0.35,
    width: width,
  },
  card: {
    width: width,
    height: height * 0.35,
  },
  image: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "100%",
  },
  content: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.dark.white,
    marginBottom: 6,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 20,
  },
  button: {
    backgroundColor: Colors.dark.white,
    paddingHorizontal: 25,
    paddingVertical: 6,
    borderRadius: 30,
  },
  buttonText: {
    color: Colors.dark.black,
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 20,
  },
  pagination: {
    flexDirection: "row",
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: Colors.dark.primary,
    width: 20,
  },
});
