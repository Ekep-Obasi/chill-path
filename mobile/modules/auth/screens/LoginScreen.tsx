import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { authService } from "../services/authService";
import { appleAuthService } from "../services/appleAuthService";
import * as AppleAuthentication from "expo-apple-authentication";
import { AUTH_CONSTANTS } from "~/lib/constants";
import { router, Stack } from "expo-router";

interface LoginErrors {
  email?: string;
  password?: string;
}

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});

  const validateForm = () => {
    const newErrors: LoginErrors = {};

    if (!email) {
      newErrors.email = AUTH_CONSTANTS.ERROR_MESSAGES.EMAIL_REQUIRED;
    } else if (!AUTH_CONSTANTS.VALIDATION.EMAIL_REGEX.test(email)) {
      newErrors.email = AUTH_CONSTANTS.ERROR_MESSAGES.INVALID_EMAIL;
    }

    if (!password) {
      newErrors.password = AUTH_CONSTANTS.ERROR_MESSAGES.PASSWORD_REQUIRED;
    } else if (password.length < AUTH_CONSTANTS.MIN_PASSWORD_LENGTH) {
      newErrors.password = AUTH_CONSTANTS.ERROR_MESSAGES.PASSWORD_TOO_SHORT;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await authService.login({ email, password });
      router.replace("/");
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error.message || AUTH_CONSTANTS.ERROR_MESSAGES.GENERAL_ERROR,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    try {
      await appleAuthService.loginWithApple();
      router.replace("/");
    } catch (error: any) {
      if (error.code !== "auth/cancelled") {
        Alert.alert(
          "Apple Login Failed",
          error.message || AUTH_CONSTANTS.ERROR_MESSAGES.GENERAL_ERROR,
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <ScrollView contentContainerClassName="flex-grow">
        <Stack.Screen options={{ headerShown: false }} />

        <View className="flex-1 justify-center px-8">
          <Text className="text-3xl font-bold mb-8 text-center">
            Welcome Back
          </Text>

          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Email</Text>
            <TextInput
              className={`border rounded-lg p-3 bg-gray-50 ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            {errors.email && (
              <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>
            )}
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 mb-2">Password</Text>
            <TextInput
              className={`border rounded-lg p-3 bg-gray-50 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {errors.password && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.password}
              </Text>
            )}
          </View>

          <TouchableOpacity
            className={`rounded-lg py-3 px-4 mb-4 ${
              isLoading ? "bg-blue-300" : "bg-blue-500"
            }`}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-center font-semibold text-lg">
                Login
              </Text>
            )}
          </TouchableOpacity>

          <View className="flex flex-row items-center my-4">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-500">OR</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {Platform.OS === "ios" && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={
                AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
              }
              buttonStyle={
                AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
              }
              cornerRadius={5}
              style={{ width: "100%", height: 50, marginBottom: 24 }}
              onPress={handleAppleLogin}
            />
          )}

          <View className="flex flex-row justify-center">
            <Text className="text-gray-600">Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.navigate("/(auth)/signup")}>
              <Text className="text-blue-500 font-semibold">Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;
