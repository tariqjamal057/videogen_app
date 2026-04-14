import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../constants/Colors";
import { Template } from "../../constants/Templates";
import PrimaryButton from "../common/PrimaryButton";

interface TemplateSectionProps {
  title: string;
  templates: Template[];
  onSeeAll?: () => void;
}

export default function TemplateSection({
  title,
  templates,
  onSeeAll,
}: TemplateSectionProps) {
  const router = useRouter();

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
    <TouchableOpacity
      key={item.id}
      style={styles.card}
      activeOpacity={0.8}
      onPress={() => handlePress(item)}
    >
      <Image
        source={require("../../assets/images/transparent-icon.png")}
        style={[StyleSheet.absoluteFill, { opacity: 0.4 }]}
        contentFit="contain"
      />
      <Image
        source={{ uri: item.image }}
        style={styles.image}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.6)"]}
        style={styles.gradient}
        locations={[0.7, 1]}
      />
      <View style={styles.buttonContainer}>
        <PrimaryButton 
          title="USE" 
          onPress={() => handlePress(item)} 
          style={styles.useButton}
          textStyle={styles.useButtonText}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={templates}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.dark.white,
    letterSpacing: 0.5,
  },
  seeAll: {
    color: Colors.dark.textMuted,
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: 15,
  },
  card: {
    width: 160,
    height: 220,
    borderRadius: 14,
    marginHorizontal: 5,
    overflow: "hidden",
    backgroundColor: Colors.dark.surface,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "60%",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 4,
    right: 0,
  },
  useButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  useButtonText: {
    fontSize: 10,
    lineHeight: 14,
  },
});
