import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

export const pickImageFromLibrary = async (onImagePicked) => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 1,
  });

  if (!result.canceled) {
    const imageUrl = result.assets[0].uri;
    onImagePicked(imageUrl);
  } else {
    Alert.alert("You did not select any image.");
  }
};
