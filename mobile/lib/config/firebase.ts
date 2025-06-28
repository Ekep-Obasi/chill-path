// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  OAuthProvider,
  getAuth,
} from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBKumvxWkiMxmcqKPrbXBVzJx3ZSb45pZY",
  authDomain: "chill-path.firebaseapp.com",
  projectId: "chill-path",
  storageBucket: "chill-path.firebasestorage.app",
  messagingSenderId: "662213532248",
  appId: "1:662213532248:web:ac1118317df4c6a503082d",
};

let app: ReturnType<typeof initializeApp>;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

let auth: ReturnType<typeof getAuth>;
try {
  auth = getAuth(app);
} catch (error) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage),
  });
}
// Initialize Apple Auth Provider
export const appleProvider = new OAuthProvider("apple.com");

appleProvider.addScope("email");
appleProvider.addScope("name");

export { auth };
export default app;
