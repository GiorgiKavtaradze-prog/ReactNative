import { useAuth, useUser } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";

export default function ProfileScreen() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSignOut = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/sign-in");
          } catch (error) {
            console.error("Error signing out:", error);
          }
        },
      },
    ]);
  };

  const handleUpdateProfileImage = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow access to your photo library to update your profile picture."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (result.canceled) return;

      setIsUpdating(true);

      const base64Image = result.assets[0].base64;
      const uri = result.assets[0].uri;
      const filename = uri.split("/").pop() || "profile.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const mimeType = match ? `image/${match[1]}` : "image/jpeg";
      const dataUrl = `data:${mimeType};base64,${base64Image}`;

      await user?.setProfileImage({ file: dataUrl });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Success", "Profile picture updated successfully!");
    } catch (error) {
      console.error("Error updating profile image:", error);
      Alert.alert(
        "Error",
        "Failed to update profile picture. Please try again."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isLoaded || !user) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#3B82F6" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Header Section */}
        <View className="items-center py-10 px-6">
          <View className="relative mb-6">
            <View className="w-32 h-32 rounded-full border-4 border-blue-50 p-1">
              <Image
                source={{ uri: user.imageUrl }}
                className="w-full h-full rounded-full"
              />
            </View>
            <TouchableOpacity
              onPress={handleUpdateProfileImage}
              disabled={isUpdating}
              className="absolute bottom-1 right-1 bg-blue-600 w-10 h-10 rounded-full items-center justify-center border-4 border-white shadow-sm"
            >
              {isUpdating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="camera" size={18} color="white" />
              )}
            </TouchableOpacity>
          </View>
          
          <Text className="text-2xl font-bold text-gray-900 text-center">
            {user.firstName} {user.lastName}
          </Text>
          <Text className="text-gray-500 font-medium text-center mt-1">
            {user.emailAddresses[0].emailAddress}
          </Text>
          
          <TouchableOpacity className="mt-4 bg-gray-50 px-6 py-2 rounded-full border border-gray-100">
            <Text className="text-gray-600 font-bold text-xs uppercase tracking-widest">Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Sections */}
        <View className="px-6">
          <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-4 px-2">Account Settings</Text>
          <View className="bg-gray-50 rounded-[32px] p-2 mb-8">
            <MenuItem
              icon="heart"
              label="Saved Properties"
              onPress={() => router.push("/(root)/(tabs)/saved")}
            />
            <MenuItem
              icon="notifications"
              label="Notifications"
              onPress={() =>
                Alert.alert("Coming Soon", "Notifications coming soon!")
              }
            />
            <MenuItem
              icon="shield-checkmark"
              label="Privacy & Security"
              onPress={() => Alert.alert("Coming Soon", "Privacy settings coming soon!")}
            />
          </View>

          <Text className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-4 px-2">Support & Info</Text>
          <View className="bg-gray-50 rounded-[32px] p-2 mb-8">
            <MenuItem
              icon="help-circle"
              label="Help Center"
              onPress={() =>
                Linking.openURL(
                  "mailto:support@kribb.app?subject=Help%20%26%20Support"
                )
              }
            />
            <MenuItem
              icon="information-circle"
              label="About Kribb"
              onPress={() => Alert.alert("Kribb v1.0.0", "The modern real estate platform.")}
            />
          </View>

          {/* Sign Out */}
          <TouchableOpacity
            onPress={handleSignOut}
            activeOpacity={0.7}
            className="flex-row items-center justify-center gap-3 bg-red-50 h-16 rounded-[24px] border border-red-100 mt-4"
          >
            <Ionicons name="log-out" size={22} color="#EF4444" />
            <Text className="text-red-500 font-bold text-lg">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
}) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.6}
      className="flex-row items-center gap-4 px-4 py-5 rounded-3xl"
    >
      <View className="w-10 h-10 bg-white rounded-xl items-center justify-center shadow-sm border border-gray-100">
        <Ionicons name={icon} size={20} color="#3B82F6" />
      </View>
      <Text className="flex-1 text-gray-800 font-bold text-base">
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
    </TouchableOpacity>
  );
}
