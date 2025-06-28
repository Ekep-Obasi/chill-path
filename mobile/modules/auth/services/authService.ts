import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User as FirebaseUser,
  getAuth,
} from "firebase/auth";
import {
  AuthResponse,
  LoginRequest,
  SignupRequest,
  User,
  AuthError,
} from "~/common/types";
import { auth } from "~/lib/config/firebase";
import { AUTH_CONSTANTS } from "~/lib/constants";
import { storageService } from "~/lib/storage";

class AuthService {
  private mapFirebaseUser(firebaseUser: FirebaseUser): User {
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || "",
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
    };
  }

  private async handleAuthResponse(
    firebaseUser: FirebaseUser,
  ): Promise<AuthResponse> {
    const token = await firebaseUser.getIdToken();
    const refreshToken = firebaseUser.refreshToken;
    const user = this.mapFirebaseUser(firebaseUser);

    // Store tokens and user data
    await Promise.all([
      storageService.setAuthToken(token),
      storageService.setRefreshToken(refreshToken),
      storageService.setUserData(user),
    ]);

    return {
      user,
      token,
      refreshToken,
    };
  }

  async login({ email, password }: LoginRequest): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      return await this.handleAuthResponse(userCredential.user);
    } catch (error: any) {
      const authError: AuthError = {
        code: error.code || "auth/unknown",
        message: this.getErrorMessage(error),
      };
      throw authError;
    }
  }

  async signup({
    email,
    password,
    displayName,
  }: SignupRequest): Promise<AuthResponse> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Update profile if displayName is provided
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }

      return await this.handleAuthResponse(userCredential.user);
    } catch (error: any) {
      const authError: AuthError = {
        code: error.code || "auth/unknown",
        message: this.getErrorMessage(error),
      };
      throw authError;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(auth);
      await storageService.clearAuthData();
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    const user = auth.currentUser;
    if (user) {
      return this.mapFirebaseUser(user);
    }
    return await storageService.getUserData();
  }

  async refreshToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
      const newToken = await user.getIdToken(true);
      await storageService.setAuthToken(newToken);
      return newToken;
    }
    return null;
  }

  private getErrorMessage(error: any): string {
    const errorMap: Record<string, string> = {
      "auth/invalid-email": AUTH_CONSTANTS.ERROR_MESSAGES.INVALID_EMAIL,
      "auth/user-disabled": "This account has been disabled",
      "auth/user-not-found": AUTH_CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS,
      "auth/wrong-password": AUTH_CONSTANTS.ERROR_MESSAGES.INVALID_CREDENTIALS,
      "auth/email-already-in-use":
        AUTH_CONSTANTS.ERROR_MESSAGES.EMAIL_ALREADY_IN_USE,
      "auth/weak-password": AUTH_CONSTANTS.ERROR_MESSAGES.WEAK_PASSWORD,
      "auth/network-request-failed":
        AUTH_CONSTANTS.ERROR_MESSAGES.NETWORK_ERROR,
    };

    return (
      errorMap[error.code] ||
      error.message ||
      AUTH_CONSTANTS.ERROR_MESSAGES.GENERAL_ERROR
    );
  }
}

export const authService = new AuthService();
