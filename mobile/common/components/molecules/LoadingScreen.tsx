import React from "react";
import { View, ActivityIndicator, Text } from "react-native";

export default function LoadingScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <ActivityIndicator size="large" color="#3B82F6" />
      <Text className="mt-4 text-gray-600 text-lg font-medium">Loading...</Text>
    </View>
  );
}
