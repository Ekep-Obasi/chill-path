/**
 * Geolocation Manager - Simple version for raw HTML app
 */

// Global geolocation functions and variables
window.userLocation = null;

/**
 * Initialize user location with geolocation
 */
window.initializeUserLocation = async function () {
  if (!navigator.geolocation) {
    console.warn("Geolocation not supported");
    return null;
  }

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      });
    });

    const coordinates = [position.coords.longitude, position.coords.latitude];
    window.userLocation = {
      lng: coordinates[0],
      lat: coordinates[1],
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    };

    // Set as start coordinates
    window.startCoordinates = coordinates;

    // Reverse geocode to get a readable address
    try {
      const MAPBOX_API_KEY =
        "pk.eyJ1IjoiYXpyYWZhbG1hcyIsImEiOiJjbWNnaXhkNjMwbGNqMmpwdGlndXZ2ZnVtIn0.mTHFqXv1Ao_h2QptWhtmlg";
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?access_token=${MAPBOX_API_KEY}&types=address`,
      );
      const data = await response.json();

      const placeName =
        data.features && data.features.length > 0
          ? data.features[0].place_name
          : `Current Location (${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)})`;

      // Set in the start location input
      const startInput = document.getElementById("route-start-search");
      if (startInput) {
        startInput.value = placeName;
        startInput.classList.add("location-selected");
      }

      console.log("User location initialized:", placeName);
      return window.userLocation;
    } catch (error) {
      console.warn("Reverse geocoding failed:", error);
      const placeName = `Current Location (${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)})`;

      const startInput = document.getElementById("route-start-search");
      if (startInput) {
        startInput.value = placeName;
        startInput.classList.add("location-selected");
      }

      return window.userLocation;
    }
  } catch (error) {
    console.warn("Could not get user location:", error);
    return null;
  }
};

/**
 * Get current user location
 */
window.getUserLocation = function () {
  return window.userLocation;
};

/**
 * Calculate distance from user location to coordinates
 */
window.getDistanceFromUser = function (coordinates) {
  if (!window.userLocation || !coordinates || coordinates.length !== 2) {
    return null;
  }

  const userCoords = [window.userLocation.lng, window.userLocation.lat];
  return window.calculateDistance(userCoords, coordinates);
};

/**
 * Calculate distance between two coordinate pairs
 */
window.calculateDistance = function (coord1, coord2) {
  const R = 6371000; // Earth's radius in meters
  const toRad = (x) => (x * Math.PI) / 180;

  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Watch user's location for changes
 */
window.watchUserLocation = function (callback) {
  if (!navigator.geolocation) {
    console.warn("Geolocation is not supported by this browser");
    return null;
  }

  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000, // 1 minute
  };

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      const coordinates = [position.coords.longitude, position.coords.latitude];
      window.userLocation = {
        lng: coordinates[0],
        lat: coordinates[1],
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      };

      if (typeof callback === "function") {
        callback(window.userLocation);
      }
    },
    (error) => {
      console.warn("Geolocation watch error:", getLocationErrorMessage(error));
    },
    options,
  );

  return watchId;
};

/**
 * Stop watching location
 */
window.stopWatchingLocation = function (watchId) {
  if (watchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
    console.log("Stopped watching user location");
  }
};

/**
 * Get human-readable error message
 */
function getLocationErrorMessage(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location access denied by user";
    case error.POSITION_UNAVAILABLE:
      return "Location information is unavailable";
    case error.TIMEOUT:
      return "Location request timed out";
    default:
      return "An unknown location error occurred";
  }
}

/**
 * Check if location is available
 */
window.isLocationAvailable = function () {
  return "geolocation" in navigator;
};

/**
 * Reverse geocode coordinates to get readable address
 */
window.reverseGeocode = async function (coordinates) {
  try {
    if (!coordinates || coordinates.length !== 2) {
      throw new Error("Invalid coordinates for reverse geocoding");
    }

    const [lng, lat] = coordinates;
    const MAPBOX_API_KEY =
      "pk.eyJ1IjoiYXpyYWZhbG1hcyIsImEiOiJjbWNnaXhkNjMwbGNqMmpwdGlndXZ2ZnVtIn0.mTHFqXv1Ao_h2QptWhtmlg";
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_API_KEY}&types=address`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Reverse geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.features && data.features.length > 0) {
      return {
        placeName: data.features[0].place_name,
        address: data.features[0].text,
        coordinates: coordinates,
      };
    } else {
      return {
        placeName: `Location (${lng.toFixed(6)}, ${lat.toFixed(6)})`,
        address: "Unknown location",
        coordinates: coordinates,
      };
    }
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    const [lng, lat] = coordinates;
    return {
      placeName: `Location (${lng.toFixed(6)}, ${lat.toFixed(6)})`,
      address: "Location name unavailable",
      coordinates: coordinates,
    };
  }
};
