import { useSavedProperty } from "@/hooks/useSavedProperty";
import { formatPrice } from "@/lib/utils";
import { Property } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import * as Haptics from "expo-haptics";

export default function PropertyCard({
  property,
  onUnsave,
  showSave = false,
}: {
  property: Property;
  onUnsave?: () => void;
  showSave?: boolean;
}) {
  const router = useRouter();
  const { isSaved, saveLoading, toggleSave } = useSavedProperty(
    property.id,
    onUnsave
  );

  const onPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(root)/property/${property.id}`);
  };

  const handleToggleSave = (e: any) => {
    e.stopPropagation();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleSave();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className="flex-row bg-white rounded-3xl mb-5 overflow-hidden border border-gray-100 p-2"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
        opacity: property.is_sold ? 0.7 : 1,
      }}
    >
      {/* Image */}
      <View className="relative">
        <Image
          source={{ uri: property.images[0] }}
          className="w-28 h-28 rounded-2xl"
          resizeMode="cover"
        />
        {property.is_sold && (
          <View className="absolute inset-0 bg-black/20 rounded-2xl items-center justify-center">
            <View className="bg-red-500 px-2 py-1 rounded-lg">
              <Text className="text-white text-[10px] font-bold uppercase">Sold</Text>
            </View>
          </View>
        )}
      </View>

      {/* Info */}
      <View className="flex-1 px-4 py-1 justify-between">
        <View>
          <View className="flex-row justify-between items-start">
            <Text
              className="text-base font-bold text-gray-900 flex-1 mr-2"
              numberOfLines={1}
            >
              {property.title}
            </Text>
            {showSave && (
              <TouchableOpacity
                onPress={handleToggleSave}
                disabled={saveLoading}
                className="w-8 h-8 items-center justify-center bg-gray-50 rounded-full"
              >
                <Ionicons
                  name={isSaved ? "heart" : "heart-outline"}
                  size={16}
                  color={isSaved ? "#EF4444" : "#9CA3AF"}
                />
              </TouchableOpacity>
            )}
          </View>
          <View className="flex-row items-center gap-1 mt-1">
            <Ionicons name="location" size={12} color="#9CA3AF" />
            <Text className="text-xs text-gray-500 font-medium" numberOfLines={1}>
              {property.city}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center justify-between mt-2">
          <Text className="text-blue-600 font-extrabold text-base">
            {formatPrice(property.price)}
          </Text>
          <View className="flex-row gap-3">
            <View className="flex-row items-center gap-1">
              <Ionicons name="bed" size={14} color="#6B7280" />
              <Text className="text-xs text-gray-600 font-bold">
                {property.bedrooms}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="scan" size={14} color="#6B7280" />
              <Text className="text-xs text-gray-600 font-bold">
                {property.area_sqft}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
