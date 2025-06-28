import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { authService } from "../services/authService";
import { appleAuthService } from "../services/appleAuthService";
import { AUTH_CONSTANTS } from "~/lib/constants";
import * as AppleAuthentication from "expo-apple-authentication";
import { router } from "expo-router";

const SignupScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    displayName?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
      displayName?: string;
    } = {};

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

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await authService.signup({
        email,
        password,
        displayName: displayName || undefined,
      });
      router.replace("/");
    } catch (error: any) {
      Alert.alert(
        "Signup Failed",
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
        <View className="flex-1 justify-center px-8 py-10">
          <Text className="text-3xl font-bold mb-8 text-center">
            Create Account
          </Text>

          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Name (Optional)</Text>
            <TextInput
              className="border border-gray-300 rounded-lg p-3 bg-gray-50"
              placeholder="Enter your name"
              value={displayName}
              onChangeText={setDisplayName}
            />
          </View>

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

          <View className="mb-4">
            <Text className="text-gray-700 mb-2">Password</Text>
            <TextInput
              className={`border rounded-lg p-3 bg-gray-50 ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Create a password"
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

          <View className="mb-6">
            <Text className="text-gray-700 mb-2">Confirm Password</Text>
            <TextInput
              className={`border rounded-lg p-3 bg-gray-50 ${
                errors.confirmPassword ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Confirm your password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            {errors.confirmPassword && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </Text>
            )}
          </View>

          <TouchableOpacity
            className={`rounded-lg py-3 px-4 mb-4 ${
              isLoading ? "bg-blue-300" : "bg-blue-500"
            }`}
            onPress={handleSignup}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-center font-semibold text-lg">
                Sign Up
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
            <Text className="text-gray-600">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.navigate("/(auth)/login")}>
              <Text className="text-blue-500 font-semibold">Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

export default SignupScreen;
