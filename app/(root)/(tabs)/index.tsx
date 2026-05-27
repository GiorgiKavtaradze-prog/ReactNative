import FeaturedCard from "@/components/FeaturedCard";
import PropertyCard from "@/components/PropertyCard";
import { FeaturedSkeleton, PropertySkeleton } from "@/components/Skeletons";
import { supabase } from "@/lib/supabase";
import { Property } from "@/types";
import { useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState, useRef, useEffect } from "react";
import {
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  Animated,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user } = useUser();
  const router = useRouter();

  const [featured, setFeatured] = useState<Property[]>([]);
  const [recommended, setRecommended] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!loading) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [loading]);

  useFocusEffect(
    useCallback(() => {
      fetchProperties();
    }, [])
  );

  const fetchProperties = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const { data: featuredData } = await supabase
        .from("properties")
        .select("*")
        .eq("is_featured", true)
        .order("created_at", { ascending: false });

      const { data: recommendedData } = await supabase
        .from("properties")
        .select("*")
        .eq("is_featured", false)
        .order("created_at", { ascending: false });

      setFeatured(featuredData ?? []);
      setRecommended(recommendedData ?? []);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onSearchPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(root)/(tabs)/search");
  };

  const onFilterPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/(root)/(tabs)/search?openFilters=true");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={loading ? [] : recommended}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchProperties(true)}
            tintColor="#2563EB"
          />
        }
        ListHeaderComponent={
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-5">
              <View>
                <Text className="text-gray-400 text-sm font-medium">
                  Good morning 👋
                </Text>
                <Text className="text-gray-900 text-xl font-bold">
                  {user?.firstName ?? "User"}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => router.push("/profile")}
                className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center overflow-hidden border border-gray-200"
              >
                {user?.imageUrl ? (
                  <Image source={{ uri: user.imageUrl }} className="w-full h-full" />
                ) : (
                  <Ionicons name="person" size={20} color="#6B7280" />
                )}
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="px-5 mb-8">
              <TouchableOpacity
                onPress={onSearchPress}
                activeOpacity={0.8}
                className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-4 gap-3 border border-gray-100"
              >
                <Ionicons name="search" size={20} color="#9CA3AF" />
                <Text className="text-gray-400 text-base flex-1 font-medium">
                  Where do you want to live?
                </Text>
                <TouchableOpacity
                  onPress={onFilterPress}
                  className="w-10 h-10 bg-blue-600 rounded-xl items-center justify-center shadow-lg shadow-blue-300"
                >
                  <Ionicons name="options" size={18} color="white" />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>

            {/* Featured Section */}
            <View className="mb-8">
              <View className="flex-row items-center justify-between px-5 mb-4">
                <Text className="text-gray-900 text-xl font-bold">
                  Featured Properties
                </Text>
                <TouchableOpacity onPress={() => router.push("/search")}>
                  <Text className="text-blue-600 font-semibold">See All</Text>
                </TouchableOpacity>
              </View>

              {loading ? (
                <FlatList
                  data={[1, 2, 3]}
                  keyExtractor={(i) => i.toString()}
                  renderItem={() => <FeaturedSkeleton />}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                />
              ) : (
                <FlatList
                  data={featured}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => <FeaturedCard property={item} />}
                  horizontal
                  snapToInterval={300} // width (288) + margin (12)
                  decelerationRate="fast"
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 20 }}
                />
              )}
            </View>

            {/* Recommended Header */}
            <View className="flex-row items-center justify-between px-5 mb-4">
              <Text className="text-gray-900 text-xl font-bold">
                Recommended for You
              </Text>
            </View>
            
            {loading && (
              <View className="px-5">
                {[1, 2, 3].map((i) => (
                  <PropertySkeleton key={i} />
                ))}
              </View>
            )}
          </Animated.View>
        }
        renderItem={({ item }) => (
          <View className="px-5">
            <PropertyCard property={item} />
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View className="items-center py-20">
              <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-4">
                <Ionicons name="home-outline" size={32} color="#D1D5DB" />
              </View>
              <Text className="text-gray-400 text-lg font-medium">No properties found</Text>
              <Text className="text-gray-400 text-sm mt-1">Try adjusting your filters</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
