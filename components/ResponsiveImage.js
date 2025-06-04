// components/ResponsiveImage.js
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, View } from "react-native";

const ResponsiveImage = ({ imageUrl, style }) => {
  const [aspectRatio, setAspectRatio] = useState(2); // Default fallback
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (imageUrl) {
      Image.getSize(
        imageUrl,
        (width, height) => {
          setAspectRatio(width / height);
          setLoading(false);
        },
        (error) => {
          console.warn("Image load error:", error);
          setAspectRatio(2);
          setLoading(false);
        }
      );
    }
  }, [imageUrl]);

  return (
    <View style={{ width: "100%" }}>
      {loading ? (
        <ActivityIndicator size="small" color="#999" />
      ) : (
        <Image
          source={{ uri: imageUrl }}
          style={[{ width: "100%", aspectRatio }, style]}
          resizeMode="contain"
        />
      )}
    </View>
  );
};

export default ResponsiveImage;
