/**
 * Application Configuration
 * Global configuration object for the Shade Navigation Tool
 */

window.CONFIG = {
  // Mapbox Configuration
  MAPBOX: {
    API_KEY:
      "pk.eyJ1IjoiYXpyYWZhbG1hcyIsImEiOiJjbWNnaXhkNjMwbGNqMmpwdGlndXZ2ZnVtIn0.mTHFqXv1Ao_h2QptWhtmlg",
    STYLE: "mapbox://styles/mapbox/streets-v11",
    DEFAULT_ZOOM: 16,
  },

  // ShadeMap Configuration
  SHADE_MAP: {
    API_KEY:
      "eyJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6IjFzYWtpYi51ZGRpbkBnbWFpbC5jb20iLCJjcmVhdGVkIjoxNzUxMTI5NjcyMTQ2LCJpYXQiOjE3NTExMjk2NzJ9.kE8qlYMd5W_J_p6rRgiwrcAHr9oHbN_ICx4nRzHyOFI",
    COLOR: "#888888",
    OPACITY: 0.82,
    TERRAIN_CONFIG: {
      maxZoom: 15,
      tileSize: 256,
      getSourceUrl: ({ x, y, z }) =>
        `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`,
      getElevation: ({ r, g, b, a }) => r * 256 + g + b / 256 - 32768,
      _overzoom: 18,
    },
  },

  // Gemini AI Configuration
  GEMINI: {
    API_KEY: "AIzaSyASfDWeZI3KngE-zX08IcDicgoDsiGYMqM", // Replace with your actual Gemini API key
    API_URL:
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
    MODEL: "gemini-pro",
    MAX_TOKENS: 200,
    TEMPERATURE: 0.7,
  },

  // Location Configuration (Toronto Metropolitan University)
  LOCATION: {
    CENTER: {
      lng: -79.3788,
      lat: 43.6577,
    },
    SEARCH_PROXIMITY: "-79.3788,43.6577",
    SEARCH_BBOX: "-79.6,43.4,-79.1,43.9",
    BUILDING_FETCH_DELTA: 0.0045, // ~500m in degrees
    POI_SEARCH_RADIUS: 2000, // 2km in meters
  },

  // API Configuration
  API: {
    BASE_URL: "https://chill-path-mo36.onrender.com",
    OVERPASS_URL: "https://overpass-api.de/api/interpreter",
    HEADERS: {
      "Content-Type": "application/json",
      "ngrok-skip-browser-warning": "true",
    },
  },

  // Autocomplete Configuration
  AUTOCOMPLETE: {
    MIN_QUERY_LENGTH: 2,
    DEBOUNCE_DELAY: 200,
    MAX_SUGGESTIONS: 5,
    SAME_LOCATION_THRESHOLD: 0.0001,
  },

  // Pathfinding Configuration
  PATHFINDING: {
    SHADE_WEIGHT_MULTIPLIER: 1.5,
    SHADOW_SAMPLE_COUNT: 5,
    MIN_BUILDING_HEIGHT: 10,
    BUILDING_LEVEL_HEIGHT: 3,
  },

  // UI Configuration
  UI: {
    TIME_UPDATE_INTERVAL: 60000, // 1 minute
    DEFAULT_TIME: "12:00",
  },

  // Chatbot Configuration
  CHATBOT: {
    MAX_CONVERSATION_LENGTH: 20, // Keep last 20 messages
    TYPING_DELAY: 1000, // 1 second typing indicator
    MAX_MESSAGE_LENGTH: 500,
  },

  // OpenWeather API Configuration
  OPENWEATHER: {
    API_KEY: "237b99631396d1ed6b70e5e263f3a32a", // Replace with your actual OpenWeather API key
  }
};
