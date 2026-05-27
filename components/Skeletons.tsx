import React, { useEffect } from "react";
import { Animated, View } from "react-native";

const Skeleton = ({ width, height, borderRadius = 8, style }: any) => {
  const opacity = new Animated.Value(0.3);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: "#E5E7EB",
          opacity,
        },
        style,
      ]}
    />
  );
};

export const FeaturedSkeleton = () => (
  <View className="mr-5 w-[260px] h-[300px] rounded-3xl bg-white p-4 shadow-sm">
    <Skeleton width="100%" height={160} borderRadius={20} />
    <View className="mt-4 gap-2">
      <Skeleton width="80%" height={20} />
      <Skeleton width="40%" height={14} />
      <View className="flex-row justify-between items-center mt-2">
        <Skeleton width="30%" height={18} />
        <Skeleton width="20%" height={18} />
      </View>
    </View>
  </View>
);

export const PropertySkeleton = () => (
  <View className="flex-row bg-white rounded-2xl mb-4 p-3 gap-3 shadow-sm">
    <Skeleton width={112} height={112} borderRadius={16} />
    <View className="flex-1 justify-between py-1">
      <View className="gap-2">
        <Skeleton width="90%" height={16} />
        <Skeleton width="50%" height={12} />
      </View>
      <View className="flex-row justify-between items-center">
        <Skeleton width="30%" height={16} />
        <Skeleton width="40%" height={14} />
      </View>
    </View>
  </View>
);
