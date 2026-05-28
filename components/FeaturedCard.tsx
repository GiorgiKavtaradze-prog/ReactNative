import { formatPrice } from "@/lib/utils";
import { Property } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

const FeaturedCard = React.memo(function FeaturedCard({ property }: { property: Property }) {
  const router = useRouter();

  const onPress = React.useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(root)/property/${property.id}`);
  }, [property.id, router]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="w-[280px] mr-5 rounded-[32px] overflow-hidden bg-white border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
        opacity: property.is_sold ? 0.7 : 1,
      }}
    >
      {/* Image Container */}
      <View className="relative">
        <Image
          source={{ uri: property.images[0] }}
          className="w-full h-48"
          contentFit="cover"
          transition={200}
        />
        
        {/* Gradient overlay simulation */}
        <View className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Badge */}
        <View className="absolute top-4 left-4 bg-white/95 px-3 py-1.5 rounded-2xl shadow-sm">
          <Text className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
            {property.type}
          </Text>
        </View>

        {property.is_sold && (
          <View className="absolute top-4 right-4 bg-red-500 px-3 py-1.5 rounded-2xl">
            <Text className="text-[10px] font-bold text-white uppercase tracking-wider">Sold</Text>
          </View>
        )}
      </View>

      {/* Info */}
      <View className="p-5">
        <View className="flex-row justify-between items-start mb-2">
          <Text
            className="text-lg font-bold text-gray-900 flex-1 mr-2"
            numberOfLines={1}
          >
            {property.title}
          </Text>
          <Text className="text-blue-600 font-extrabold text-lg">
            {formatPrice(property.price)}
          </Text>
        </View>

        <View className="flex-row items-center gap-1 mb-4">
          <Ionicons name="location" size={14} color="#3B82F6" />
          <Text className="text-sm text-gray-500 font-medium" numberOfLines={1}>
            {property.city}
          </Text>
        </View>

        <View className="flex-row items-center justify-between pt-4 border-t border-gray-50">
          <View className="flex-row items-center gap-4">
            <View className="flex-row items-center gap-1.5">
              <View className="w-7 h-7 bg-blue-50 rounded-full items-center justify-center">
                <Ionicons name="bed" size={14} color="#3B82F6" />
              </View>
              <Text className="text-xs text-gray-600 font-bold">{property.bedrooms}</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-7 h-7 bg-blue-50 rounded-full items-center justify-center">
                <Ionicons name="water" size={14} color="#3B82F6" />
              </View>
              <Text className="text-xs text-gray-600 font-bold">
                {property.bathrooms}
              </Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View className="w-7 h-7 bg-blue-50 rounded-full items-center justify-center">
                <Ionicons name="scan" size={14} color="#3B82F6" />
              </View>
              <Text className="text-xs text-gray-600 font-bold">
                {property.area_sqft}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
});

export default FeaturedCard;
