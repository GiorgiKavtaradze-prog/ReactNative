import { useSupabase } from "@/hooks/useSupabase";
import { Property } from "@/types";
import { useAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState, useRef, useEffect } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  View,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import PropertyCard from "@/components/PropertyCard";
import { PropertySkeleton } from "@/components/Skeletons";

interface SavedProperty {
  id: string;
  property_id: string;
  properties: Property;
}

export default function SavedScreen() {
  const { userId } = useAuth();
  const authSupabase = useSupabase();
  const router = useRouter();

  const [saved, setSaved] = useState<SavedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchSaved = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await authSupabase
      .from("saved_properties")
      .select("id, property_id, properties(*)")
      .eq("user_clerk_id", userId)
      .order("id", { ascending: false });

    setSaved((data as unknown as SavedProperty[]) ?? []);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [loading]);

  // Refresh every time the tab comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchSaved();
    }, [fetchSaved])
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-4 pb-4">
        <Text className="text-3xl font-bold text-gray-900">Saved</Text>
        {!loading && (
          <Text className="text-sm text-gray-400 font-medium mt-1">
            {saved.length} {saved.length === 1 ? "property" : "properties"}{" "}
            in your collection
          </Text>
        )}
      </View>

      <View className="flex-1 px-5">
        {loading ? (
          <View>
            {[1, 2, 3].map((i) => (
              <PropertySkeleton key={i} />
            ))}
          </View>
        ) : (
          <Animated.FlatList
            style={{ opacity: fadeAnim }}
            data={saved}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <PropertyCard
                property={item.properties}
                onUnsave={() =>
                  setSaved((prev) => prev.filter((s) => s.id !== item.id))
                }
                showSave
              />
            )}
            ListEmptyComponent={
              <View className="items-center py-24">
                <View className="w-24 h-24 bg-red-50 rounded-[40px] items-center justify-center mb-6">
                  <Ionicons name="heart" size={40} color="#EF4444" />
                </View>
                <Text className="text-gray-900 text-xl font-bold mb-2">
                  No saved properties
                </Text>
                <Text className="text-gray-400 text-sm text-center px-10 leading-6">
                  Items you save will appear here. Start exploring to build your dream collection.
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/(root)/(tabs)/search")}
                  className="mt-8 bg-blue-600 px-10 py-4 rounded-[24px] shadow-lg shadow-blue-200"
                >
                  <Text className="text-white font-bold text-base">
                    Discover Properties
                  </Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
