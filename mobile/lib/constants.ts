export const NAV_THEME = {
  light: {
    background: "hsl(0 0% 100%)", // background
    border: "hsl(240 5.9% 90%)", // border
    card: "hsl(0 0% 100%)", // card
    notification: "hsl(0 84.2% 60.2%)", // destructive
    primary: "hsl(240 5.9% 10%)", // primary
    text: "hsl(240 10% 3.9%)", // foreground
  },
  dark: {
    background: "hsl(240 10% 3.9%)", // background
    border: "hsl(240 3.7% 15.9%)", // border
    card: "hsl(240 10% 3.9%)", // card
    notification: "hsl(0 72% 51%)", // destructive
    primary: "hsl(0 0% 98%)", // primary
    text: "hsl(0 0% 98%)", // foreground
  },
};

export const AUTH_CONSTANTS = {
  MIN_PASSWORD_LENGTH: 8,
  STORAGE_KEYS: {
    AUTH_TOKEN: "auth_token",
    REFRESH_TOKEN: "refresh_token",
    USER_DATA: "user_data",
  },
  ERROR_MESSAGES: {
    INVALID_EMAIL: "Please enter a valid email address",
    PASSWORD_TOO_SHORT: "Password must be at least 8 characters",
    PASSWORD_REQUIRED: "Password is required",
    EMAIL_REQUIRED: "Email is required",
    GENERAL_ERROR: "Something went wrong. Please try again.",
    NETWORK_ERROR: "Network error. Please check your connection.",
    INVALID_CREDENTIALS: "Invalid email or password",
    EMAIL_ALREADY_IN_USE: "Email already in use",
    WEAK_PASSWORD: "Password is too weak",
  },
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
};
