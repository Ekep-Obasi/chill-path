/**
 * Main Application Entry Point
 * Raw HTML app with global variables and functions
 */

// Global application state
window.startCoordinates = null;
window.endCoordinates = null;
window.mapManager = null;
window.shadeSystem = null;
window.startAutocomplete = null;
window.endAutocomplete = null;

/**
 * Update button states based on coordinate availability
 */
window.updateButtonStates = function () {
  const routeBtn = document.getElementById("get-route");
  const shadyBtn = document.getElementById("find-shadiest-path");

  const hasValidLocations = window.startCoordinates && window.endCoordinates;

  if (routeBtn) {
    routeBtn.disabled = !hasValidLocations;
  }
  if (shadyBtn) {
    shadyBtn.disabled = !hasValidLocations;
  }
};

/**
 * Initialize user location with geolocation
 */
async function initializeUserLocation() {
  if (!navigator.geolocation) {
    window.log("Geolocation not supported");
    return;
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
    window.startCoordinates = coordinates;

    // Reverse geocode to get a readable address
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coordinates[0]},${coordinates[1]}.json?access_token=${window.CONFIG.MAPBOX.API_KEY}&types=address`,
      );
      const data = await response.json();

      const placeName =
        data.features && data.features.length > 0
          ? data.features[0].place_name
          : `Current Location (${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)})`;

      window.startAutocomplete.setLocation(coordinates, placeName);
    } catch (error) {
      console.warn("Reverse geocoding failed:", error);
      const placeName = `Current Location (${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)})`;
      window.startAutocomplete.setLocation(coordinates, placeName);
    }

    window.log("User location initialized");
  } catch (error) {
    window.log("Could not get user location:", error);
  }
}

/**
 * Handle update shadows button click
 */
async function handleUpdateShadows() {
  const timeInput = document.getElementById("sun-time");
  const timeStr = timeInput.value;

  if (!window.ValidationUtils.isValidTime(timeStr)) {
    alert("Please enter a valid time.");
    return;
  }

  try {
    await window.shadeSystem.renderShadowsForTime(timeStr);
    window.mapManager.updateShadeMapTime(timeStr);
    window.log("Shadows updated for time:", timeStr);
  } catch (error) {
    console.error("Error updating shadows:", error);
    alert("Failed to update shadows.");
  }
}

/**
 * Handle get route button click
 */
async function handleGetRoute() {
  if (!window.startCoordinates || !window.endCoordinates) {
    alert("Please select both start and destination locations.");
    return;
  }

  try {
    const requestBody = {
      start: window.startCoordinates,
      end: window.endCoordinates,
      mode: "walking",
      route_index: 0,
    };

    const response = await fetch(`${window.CONFIG.API.BASE_URL}/mapping`, {
      method: "POST",
      headers: window.CONFIG.API.HEADERS,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Route API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract coordinates from response
    let coordinates = [];
    if (data.geometry && data.geometry.coordinates) {
      coordinates = data.geometry.coordinates;
    } else if (data.route && Array.isArray(data.route)) {
      coordinates = data.route;
    } else if (data.route && data.route.type === "LineString") {
      coordinates = data.route.coordinates;
    }

    if (coordinates.length > 1) {
      // Render route on map
      window.mapManager.renderRoute(coordinates);

      // Calculate shade rating
      const shadeRating = window.shadeSystem.calculateShadeRating(coordinates);
      const message = `Route found! Shade coverage: ${window.formatNumber(shadeRating * 100)}%`;

      alert(message);
      window.log(message);
    } else {
      throw new Error("No valid route coordinates found");
    }
  } catch (error) {
    console.error("Error getting route:", error);
    alert("Failed to calculate route. Please try again.");
  }
}

/**
 * Handle find shadiest path button click
 */
async function handleFindShadyPath() {
  if (!window.startCoordinates || !window.endCoordinates) {
    alert("Please select both start and destination locations.");
    return;
  }

  try {
    // Create routing system instance
    const routingSystem = new window.RoutingSystem(
      window.mapManager,
      window.shadeSystem,
    );

    // Find and render shady path
    const result = await routingSystem.findShadiestPath(
      window.startCoordinates,
      window.endCoordinates,
    );

    alert(result.message);
    window.log(result.message);
  } catch (error) {
    console.error("Error finding shady path:", error);
    alert("Failed to find shady path. Please try again.");
  }
}

/**
 * Handle show highways button click
 */
async function handleShowHighways() {
  try {
    const routingSystem = new window.RoutingSystem(
      window.mapManager,
      window.shadeSystem,
    );
    await routingSystem.renderHighwayNetwork();
    window.log("Highway network displayed");
  } catch (error) {
    console.error("Error showing highways:", error);
    alert("Failed to load road network.");
  }
}

/**
 * Set up time controls and auto-update
 */
function initializeTimeControls() {
  const sunTimeInput = document.getElementById("sun-time");
  if (sunTimeInput) {
    sunTimeInput.value = window.TimeUtils.getCurrentTime();
  }

  // Auto-update time every minute
  setInterval(() => {
    const currentTime = window.TimeUtils.getCurrentTime();
    if (sunTimeInput && sunTimeInput.value !== currentTime) {
      sunTimeInput.value = currentTime;

      // Update shadows if map is loaded
      if (
        window.mapManager &&
        window.mapManager.isMapLoaded() &&
        window.shadeSystem
      ) {
        window.shadeSystem.renderShadowsForTime(currentTime);
        window.mapManager.updateShadeMapTime(currentTime);
      }
    }
  }, window.CONFIG.UI.TIME_UPDATE_INTERVAL);
}

/**
 * Initialize POI markers
 */
async function initializePOIs() {
  const poiManager = new window.POIManager(window.mapManager);
  await poiManager.initialize();

  // Re-add markers after style changes
  window.mapManager.getMap().on("style.load", () => {
    poiManager.reloadAll();
  });
}

/**
 * Main initialization function
 */
async function initializeApp() {
  try {
    window.log("Initializing Shade Navigation App...");

    // Initialize map manager
    window.mapManager = new window.MapManager();
    await window.mapManager.initialize();

    // Initialize shade system
    window.shadeSystem = new window.ShadeSystem(window.mapManager);

    // Initialize autocomplete components
    window.startAutocomplete = new window.LocationAutocomplete(
      "route-start-search",
      "start-suggestions",
      "start-validation",
      "start location",
    );

    window.endAutocomplete = new window.LocationAutocomplete(
      "route-end-search",
      "end-suggestions",
      "end-validation",
      "destination",
    );

    // Initialize time controls
    initializeTimeControls();

    // Set up event listeners
    document
      .getElementById("update-shadows")
      .addEventListener("click", handleUpdateShadows);
    document
      .getElementById("get-route")
      .addEventListener("click", handleGetRoute);
    document
      .getElementById("find-shadiest-path")
      .addEventListener("click", handleFindShadyPath);
    document
      .getElementById("show-highways")
      .addEventListener("click", handleShowHighways);

    // Handle time input changes
    document
      .getElementById("sun-time")
      .addEventListener("change", async (e) => {
        const timeStr = e.target.value;
        if (
          window.ValidationUtils.isValidTime(timeStr) &&
          window.mapManager.isMapLoaded()
        ) {
          await window.shadeSystem.renderShadowsForTime(timeStr);
          window.mapManager.updateShadeMapTime(timeStr);
        }
      });

    // Initialize user location
    await initializeUserLocation();

    // Handle map load events
    window.mapManager.getMap().on("load", async () => {
      try {
        // Initialize buildings and shadows
        await window.shadeSystem.initializeBuildingsCache();
        await window.shadeSystem.renderShadowsForTime(
          window.CONFIG.UI.DEFAULT_TIME,
        );

        // Initialize POIs
        await initializePOIs();

        window.log("Map fully loaded and initialized");
      } catch (error) {
        console.error("Error during map load:", error);
      }
    });

    // Update initial button states
    window.updateButtonStates();

    window.log("Shade Navigation App initialized successfully");
  } catch (error) {
    console.error("Failed to initialize application:", error);
    alert("Failed to initialize the application. Please refresh the page.");
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initializeApp);
