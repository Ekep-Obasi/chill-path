import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "~/common/types";
import { AUTH_CONSTANTS } from "./constants";

class StorageService {
  async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTH_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN, token);
    } catch (error) {
      console.error("Error storing auth token:", error);
      throw error;
    }
  }

  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AUTH_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN);
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  }

  async setRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(
        AUTH_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN,
        token,
      );
    } catch (error) {
      console.error("Error storing refresh token:", error);
      throw error;
    }
  }

  async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(
        AUTH_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN,
      );
    } catch (error) {
      console.error("Error getting refresh token:", error);
      return null;
    }
  }

  async setUserData(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(
        AUTH_CONSTANTS.STORAGE_KEYS.USER_DATA,
        JSON.stringify(user),
      );
    } catch (error) {
      console.error("Error storing user data:", error);
      throw error;
    }
  }

  async getUserData(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(
        AUTH_CONSTANTS.STORAGE_KEYS.USER_DATA,
      );
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }

  async clearAuthData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        AUTH_CONSTANTS.STORAGE_KEYS.AUTH_TOKEN,
        AUTH_CONSTANTS.STORAGE_KEYS.REFRESH_TOKEN,
        AUTH_CONSTANTS.STORAGE_KEYS.USER_DATA,
      ]);
    } catch (error) {
      console.error("Error clearing auth data:", error);
      throw error;
    }
  }
}

export const storageService = new StorageService();
