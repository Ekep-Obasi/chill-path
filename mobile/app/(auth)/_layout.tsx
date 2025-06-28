import React from "react";
import { Slot, Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <SafeAreaView>
        <Slot />
      </SafeAreaView>
    </Stack>
  );
}
