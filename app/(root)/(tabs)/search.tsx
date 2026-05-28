import FilterModal from "@/components/FilterModal";
import PropertyCard from "@/components/PropertyCard";
import { PropertySkeleton } from "@/components/Skeletons";
import { useDebounce } from "@/hooks/useDebounce";
import { supabase } from "@/lib/supabase";
import { formatPrice } from "@/lib/utils";
import { useFilterStore } from "@/store/filterStore";
import { Property } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SearchScreen = React.memo(function SearchScreen() {
  const [results, setResults] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { openFilters } = useLocalSearchParams<{ openFilters?: string }>();

  // Optimized Zustand selectors to only re-render when relevant state changes
  const search = useFilterStore(state => state.search);
  const type = useFilterStore(state => state.type);
  const bedrooms = useFilterStore(state => state.bedrooms);
  const minPrice = useFilterStore(state => state.minPrice);
  const maxPrice = useFilterStore(state => state.maxPrice);
  const setSearch = useFilterStore(state => state.setSearch);
  const setType = useFilterStore(state => state.setType);
  const setBedrooms = useFilterStore(state => state.setBedrooms);
  const setMinPrice = useFilterStore(state => state.setMinPrice);
  const setMaxPrice = useFilterStore(state => state.setMaxPrice);

  const debouncedSearch = useDebounce(search, 500);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (openFilters === "true") {
      setShowFilters(true);
    }
  }, [openFilters]);

  const fetchResults = useCallback(async () => {
    setLoading(true);

    let query = supabase.from("properties").select("*");

    if (debouncedSearch) {
      query = query.or(`title.ilike.%${debouncedSearch}%,city.ilike.%${debouncedSearch}%`);
    }

    if (type) query = query.eq("type", type);
    if (bedrooms) query = query.eq("bedrooms", bedrooms);
    if (minPrice) query = query.gte("price", minPrice);
    if (maxPrice) query = query.lte("price", maxPrice);

    const { data } = await query.order("created_at", { ascending: false });

    setResults(data ?? []);
    setLoading(false);
  }, [debouncedSearch, type, bedrooms, minPrice, maxPrice]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

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

  const activeFilterCount = [
    type !== null,
    bedrooms !== null,
    minPrice !== null,
    maxPrice !== null,
  ].filter(Boolean).length;

  const onFilterPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowFilters(true);
  }, []);

  const renderItem = useCallback(({ item }: { item: Property }) => <PropertyCard property={item} />, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-5 pt-4 pb-4">
        <Text className="text-3xl font-bold text-gray-900 mb-6">
          Find Your Home
        </Text>

        {/* Search Bar + Filter Button */}
        <View className="flex-row items-center gap-3">
          <View className="flex-1 flex-row items-center bg-gray-50 border border-gray-100 rounded-2xl px-4 gap-3">
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 py-4 text-gray-800 text-base font-medium"
              placeholder="Search city, title..."
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              returnKeyType="search"
              onSubmitEditing={() => Keyboard.dismiss()}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={20} color="#D1D5DB" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Button */}
          <TouchableOpacity
            onPress={onFilterPress}
            activeOpacity={0.8}
            className={`w-14 h-14 rounded-2xl items-center justify-center shadow-lg ${
              activeFilterCount > 0 ? "bg-blue-600 shadow-blue-200" : "bg-white border border-gray-100 shadow-gray-100"
            }`}
          >
            <Ionicons
              name="options"
              size={22}
              color={activeFilterCount > 0 ? "#fff" : "#3B82F6"}
            />
            {activeFilterCount > 0 && (
              <View className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full items-center justify-center border-2 border-white">
                <Text className="text-white text-[10px] font-black">
                  {activeFilterCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <View className="flex-row flex-wrap gap-2 mt-4">
            {type && (
              <View className="flex-row items-center bg-blue-50 border border-blue-100 rounded-xl px-3 py-1.5 gap-1.5">
                <Text className="text-blue-600 text-[10px] font-extrabold uppercase tracking-wider">
                  {type}
                </Text>
                <TouchableOpacity onPress={() => setType(null)}>
                  <Ionicons name="close" size={14} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            )}
            {bedrooms !== null && (
              <View className="flex-row items-center bg-blue-50 border border-blue-100 rounded-xl px-3 py-1.5 gap-1.5">
                <Text className="text-blue-600 text-[10px] font-extrabold uppercase tracking-wider">
                  {bedrooms === 4 ? "4+ BEDS" : `${bedrooms} BEDS`}
                </Text>
                <TouchableOpacity onPress={() => setBedrooms(null)}>
                  <Ionicons name="close" size={14} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            )}
            {(minPrice !== null || maxPrice !== null) && (
              <View className="flex-row items-center bg-blue-50 border border-blue-100 rounded-xl px-3 py-1.5 gap-1.5">
                <Text className="text-blue-600 text-[10px] font-extrabold uppercase tracking-wider">
                  {minPrice && maxPrice
                    ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
                    : minPrice
                    ? `>${formatPrice(minPrice)}`
                    : `<${formatPrice(maxPrice!)}`}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setMinPrice(null);
                    setMaxPrice(null);
                  }}
                >
                  <Ionicons name="close" size={14} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Results */}
      <View className="flex-1 px-5">
        {loading ? (
          <View>
            {[1, 2, 3, 4, 5].map((i) => (
              <PropertySkeleton key={i} />
            ))}
          </View>
        ) : (
          <Animated.FlatList
            style={{ opacity: fadeAnim }}
            data={results}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100, paddingTop: 10 }}
            renderItem={renderItem}
            maxToRenderPerBatch={5}
            windowSize={10}
            removeClippedSubviews
            ListEmptyComponent={
              <View className="items-center py-20">
                <View className="w-20 h-20 bg-gray-50 rounded-full items-center justify-center mb-4">
                  <Ionicons name="search" size={32} color="#D1D5DB" />
                </View>
                <Text className="text-gray-900 text-lg font-bold">No results found</Text>
                <Text className="text-gray-400 text-sm mt-1 text-center">
                  We couldn't find any properties matching
                  {"\n"}your current filters.
                </Text>
              </View>
            }
          />
        )}
      </View>

      <FilterModal visible={showFilters} onClose={() => setShowFilters(false)} />
    </SafeAreaView>
  );
});

export default SearchScreen;
