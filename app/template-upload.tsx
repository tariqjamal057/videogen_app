import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { ScreenHeader } from "../components/common/ScreenHeader";
import Colors from "../constants/Colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useGetTopTemplatesQuery, useGetTemplatesByCategoryQuery } from "../store/api/apiSlice";
import { Template } from "../constants/Templates";
import VideoUploadPlaceholder from "../assets/images/videoUploadPlaceholder.svg";

const { width, height } = Dimensions.get("window");
const HORIZONTAL_PADDING = 12;
const GAP = 10;
const ITEM_WIDTH_SMALL = (width - (HORIZONTAL_PADDING * 2) - (GAP * 3)) / 4;

export default function TemplateUploadScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { id, title, image, inputCount, templateType, inputType, categoryId } = params;

  const count = parseInt(inputCount as string) || 1;
  const [selectedImages, setSelectedImages] = useState<string[]>(new Array(count).fill(""));

  const { data: categories } = useGetTemplatesByCategoryQuery();
  const currentCategory = categories?.find(cat => cat.id === categoryId);
  const relatedTemplates = currentCategory?.templates.filter(t => t.id !== id) || [];

  const handlePickImage = async (index: number) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission Denied",
        text2: `We need access to your gallery to upload ${inputType === 'video' ? 'videos' : 'images'}.`,
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: inputType === 'video' ? ["videos"] : ["images"],
      allowsEditing: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const newImages = [...selectedImages];
      newImages[index] = result.assets[0].uri;
      setSelectedImages(newImages);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...selectedImages];
    newImages[index] = "";
    setSelectedImages(newImages);
  };

  const isValid = selectedImages.filter((img) => img).length === count;

  const handleGenerateVideo = () => {
    if (!isValid) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: `Please select ${count} ${inputType === 'video' ? 'video(s)' : 'image(s)'}.`,
      });
      return;
    }

    router.push({
      pathname: "/generation-config",
      params: { 
        ...params,
        selectedImages: JSON.stringify(selectedImages)
      },
    });
  };

  const handleRelatedTemplatePress = (template: Template) => {
    router.replace({
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

  const renderUploadBox = (index: number, isSmall: boolean = false) => {
    const uri = selectedImages[index];
    return (
      <TouchableOpacity
        key={index}
        style={[styles.uploadBox, isSmall && styles.uploadBoxSmall]}
        onPress={() => (uri ? handleRemoveImage(index) : handlePickImage(index))}
        activeOpacity={0.8}
      >
        {uri ? (
          <View style={styles.selectedImageContainer}>
            {inputType === 'video' ? (
               <View style={styles.selectedImage}>
                  <MaterialCommunityIcons name="movie-play" size={40} color="#FFF" style={{alignSelf: 'center', marginTop: 10}} />
                  <Text style={{color: '#FFF', fontSize: 10, textAlign: 'center'}} numberOfLines={1}>{uri.split('/').pop()}</Text>
               </View>
            ) : (
              <Image source={{ uri }} style={styles.selectedImage} />
            )}
            <View style={styles.removeBadge}>
              <MaterialCommunityIcons name="close" size={14} color="#FFF" />
            </View>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            {templateType === "image" ? (
              <MaterialCommunityIcons
                name="account"
                size={isSmall ? 50 : 60}
                color="rgba(255,255,255,0.6)"
              />
            ) : (
              <>
                <VideoUploadPlaceholder
                  width={isSmall ? 30 : 60}
                  height={isSmall ? 30 : 60}
                  style={{ marginBottom: 8 }}
                />
                <Text style={[styles.uploadLabel, isSmall && { fontSize: 8 }]}>
                  {inputType === 'video' ? 'Video' : 'Image'} {index + 1}
                </Text>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* <LinearGradient
        colors={[Colors.dark.gradientStart, Colors.dark.gradientEnd]}
        style={styles.background}
      /> */}
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <ScreenHeader title={title as string} />
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={[
            styles.demoWrapper,
            { height: templateType === 'image' ? height * 0.65 : height * 0.45 }
          ]}>
            <Image
              source={{ uri: image as string }}
              style={styles.demoImage}
              contentFit="cover"
              transition={300}
            />
          </View>

          <View style={styles.uploadSection}>
            {templateType === 'image' ? (
              <View style={styles.imageTypeContainer}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={styles.sectionLabel}>Use {inputType === 'video' ? 'Video' : 'Image'}</Text>
                  {renderUploadBox(0, true)}
                </View>
                <View style={{ flex: 1 }}>
                  {relatedTemplates.length > 0 && (
                    <View style={{ width: ITEM_WIDTH_SMALL, alignItems: 'center' }}>
                      <Text style={styles.sectionLabel} numberOfLines={1}>More templates</Text>
                    </View>
                  )}
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    contentContainerStyle={styles.horizontalScrollOnlyTemplates}
                  >
                    {relatedTemplates.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.templateBoxSmall}
                        onPress={() => handleRelatedTemplatePress(item)}
                        activeOpacity={0.8}
                      >
                        <Image
                          source={{ uri: item.image }}
                          style={styles.relatedImage}
                          contentFit="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            ) : (
              <View style={styles.uploadGrid}>
                {selectedImages.map((_, index) => renderUploadBox(index))}
              </View>
            )}
            
            <Text style={styles.hintText}>
              Upload your {inputType === 'video' ? 'videos' : 'images'} in these boxes to create a {templateType === 'image' ? 'image' : 'video'} like this.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.generateButton, !isValid && styles.disabledButton]}
            onPress={handleGenerateVideo}
            disabled={!isValid}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={templateType === "image" ? ["#002375", "#0047ED"] : ["#820036", "#FF006A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.generateGradient}
            >
              <Text style={styles.generateButtonText}>
                {templateType === "image" ? "Generate Image" : "Generate Video"}
              </Text>
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
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
  },
  demoWrapper: {
    width: "100%",
    height: height * 0.45,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: Colors.dark.surface,
    marginBottom: 15,
  },
  demoImage: {
    width: "100%",
    height: "100%",
  },
  uploadSection: {
    alignItems: "center",
  },
  imageTypeContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    width: "100%",
    gap: GAP,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: "Molengo",
    fontWeight: "400",
    color: "#fff",
    marginBottom: 6,
  },
  uploadGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    gap: 10,
  },
  horizontalScrollOnlyTemplates: {
    gap: GAP,
    paddingRight: HORIZONTAL_PADDING,
  },
  uploadBox: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    aspectRatio: 1,
    minWidth: "48%",
  },
  uploadBoxSmall: {
    width: ITEM_WIDTH_SMALL,
    height: ITEM_WIDTH_SMALL,
    minWidth: ITEM_WIDTH_SMALL,
  },
  templateBoxSmall: {
    width: ITEM_WIDTH_SMALL,
    height: ITEM_WIDTH_SMALL,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  relatedImage: {
    width: "100%",
    height: "100%",
  },
  selectedImageContainer: {
    width: "100%",
    height: "100%",
  },
  selectedImage: {
    width: "100%",
    height: "100%",
  },
  removeBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    width: 60,
    height: 60,
    marginBottom: 8,
  },
  uploadLabel: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 23,
    fontFamily: "Molengo",
  },
  hintText: {
    fontSize: 10,
    fontFamily: "Molengo",
    fontWeight: "400",
    color: "#D0D0D0",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 30,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  generateButton: {
    width: "100%",
    height: 43,
    borderRadius: 25,
    overflow: "hidden",
  },
  generateGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  generateButtonText: {
    fontSize: 16,
    fontFamily: "Molengo",
    fontWeight: "400",
    color: Colors.dark.white,
  },
  disabledButton: {
    // opacity: 0.5,
  },
});