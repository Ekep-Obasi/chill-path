/**
 * Utility Functions
 * Global utility functions and helpers
 */

// Geographic utility functions
window.GeoUtils = {
  /**
   * Calculate Haversine distance between two points
   */
  haversine(lon1, lat1, lon2, lat2) {
    const R = 6371000; // Earth's radius in meters
    const toRad = (x) => (x * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },

  /**
   * Calculate simple Euclidean distance between coordinates
   */
  getDistance(coord1, coord2) {
    const dx = coord1[0] - coord2[0];
    const dy = coord1[1] - coord2[1];
    return Math.sqrt(dx * dx + dy * dy);
  },

  /**
   * Check if coordinates are within a certain threshold
   */
  areCoordinatesEqual(
    coord1,
    coord2,
    threshold = window.CONFIG.AUTOCOMPLETE.SAME_LOCATION_THRESHOLD,
  ) {
    return this.getDistance(coord1, coord2) < threshold;
  },
};

// Time utility functions
window.TimeUtils = {
  /**
   * Get current time in HH:MM format
   */
  getCurrentTime() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  },

  /**
   * Create Date object from time string and current date
   */
  createDateFromTime(timeStr) {
    const today = new Date();
    const [hh, mm] = timeStr.split(":");
    return new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      parseInt(hh),
      parseInt(mm),
    );
  },

  /**
   * Get sun position for given coordinates and time
   */
  getSunPosition(lat, lng, date = new Date()) {
    if (typeof SunCalc === "undefined") {
      console.error("SunCalc library not loaded");
      return { azimuth: 0, altitude: 0 };
    }
    const pos = SunCalc.getPosition(date, lat, lng);
    return { azimuth: pos.azimuth, altitude: pos.altitude };
  },
};

// DOM utility functions
window.DOMUtils = {
  /**
   * Get element by ID with error handling
   */
  getElementById(id) {
    const element = document.getElementById(id);
    if (!element) {
      console.error(`Element with ID '${id}' not found`);
    }
    return element;
  },

  /**
   * Add event listener with error handling
   */
  addEventListener(element, event, handler) {
    if (element && typeof handler === "function") {
      element.addEventListener(event, handler);
    } else {
      console.error("Invalid element or handler for event listener");
    }
  },

  /**
   * Toggle class on element
   */
  toggleClass(element, className, condition) {
    if (element) {
      if (condition) {
        element.classList.add(className);
      } else {
        element.classList.remove(className);
      }
    }
  },

  /**
   * Show/hide element
   */
  toggleVisibility(element, visible) {
    if (element) {
      element.style.display = visible ? "block" : "none";
    }
  },
};

// API utility functions
window.APIUtils = {
  /**
   * Make HTTP request with error handling
   */
  async request(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: window.CONFIG.API.HEADERS,
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  },

  /**
   * Build URL with query parameters
   */
  buildURL(baseUrl, params = {}) {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, value);
      }
    });
    return url.toString();
  },
};

// Validation utility functions
window.ValidationUtils = {
  /**
   * Validate coordinates
   */
  isValidCoordinates(coords) {
    return (
      Array.isArray(coords) &&
      coords.length === 2 &&
      typeof coords[0] === "number" &&
      typeof coords[1] === "number" &&
      coords[0] >= -180 &&
      coords[0] <= 180 &&
      coords[1] >= -90 &&
      coords[1] <= 90
    );
  },

  /**
   * Validate time string
   */
  isValidTime(timeStr) {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeStr);
  },
};

/**
 * Debounce function for limiting API calls
 */
window.debounce = function (func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Format numbers for display
 */
window.formatNumber = function (num, decimals = 1) {
  return Number(num).toFixed(decimals);
};

/**
 * Log with timestamp
 */
window.log = function (message, data = null) {
  const timestamp = new Date().toISOString();
  if (data) {
    console.log(`[${timestamp}] ${message}`, data);
  } else {
    console.log(`[${timestamp}] ${message}`);
  }
};
