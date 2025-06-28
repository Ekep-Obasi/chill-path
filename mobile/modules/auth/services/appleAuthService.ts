import {
  OAuthProvider,
  signInWithCredential,
  updateProfile,
} from "firebase/auth";
import * as AppleAuthentication from "expo-apple-authentication";
import { Platform } from "react-native";
import { AuthResponse, AuthError } from "~/common/types";
import { auth } from "~/lib/config/firebase";
import { AUTH_CONSTANTS } from "~/lib/constants";

class AppleAuthService {
  async loginWithApple(): Promise<AuthResponse> {
    try {
      // Apple Authentication is only available on iOS
      if (Platform.OS !== "ios") {
        throw new Error("Apple Sign In is only available on iOS devices");
      }

      // Request Apple authentication
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      // Check if we have a valid ID token
      if (!appleCredential.identityToken) {
        throw new Error("Apple Sign In failed: No identity token returned");
      }

      // Create OAuthCredential for Firebase
      const provider = new OAuthProvider("apple.com");
      provider.addScope("email");
      provider.addScope("name");

      const credential = provider.credential({
        idToken: appleCredential.identityToken,
      });

      // Sign in with Firebase
      const userCredential = await signInWithCredential(auth, credential);

      // Process the authenticated user
      const token = await userCredential.user.getIdToken();
      const refreshToken = userCredential.user.refreshToken;

      // If this is a new user and we have full name information, update the profile
      if (
        appleCredential.fullName &&
        appleCredential.fullName.givenName &&
        !userCredential.user.displayName
      ) {
        const displayName =
          `${appleCredential.fullName.givenName} ${appleCredential.fullName.familyName || ""}`.trim();

        // Update user profile
        await updateProfile(userCredential.user, { displayName });
      }

      const user = {
        id: userCredential.user.uid,
        email: userCredential.user.email || "",
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
        createdAt:
          userCredential.user.metadata.creationTime || new Date().toISOString(),
      };

      return {
        user,
        token,
        refreshToken,
      };
    } catch (error: any) {
      if (error.code === "ERR_CANCELED") {
        // User cancelled the Apple sign-in
        const authError: AuthError = {
          code: "auth/cancelled",
          message: "Apple Sign In was cancelled by the user",
        };
        throw authError;
      }

      const authError: AuthError = {
        code: error.code || "auth/apple-sign-in-failed",
        message: error.message || AUTH_CONSTANTS.ERROR_MESSAGES.GENERAL_ERROR,
      };
      throw authError;
    }
  }

  // Get the provider ID for Apple Auth
  getProviderId(): string {
    return "apple.com";
  }

  // Check if Apple Authentication is available on this device
  async isAvailable(): Promise<boolean> {
    if (Platform.OS !== "ios") {
      return false;
    }
    return await AppleAuthentication.isAvailableAsync();
  }
}

export const appleAuthService = new AppleAuthService();
