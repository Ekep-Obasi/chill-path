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
window.heatSafeChatbot = null;
window.roadNetworkData = null; // Store the loaded road network data
window.isRoadNetworkVisible = false; // Track visual state only

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

    // Plot user location marker on the map
    if (window.mapManager && window.mapManager.getMap) {
      const map = window.mapManager.getMap();
      if (map && map.loaded()) {
        // Remove any existing user marker
        if (window.userLocationMarker) {
          window.userLocationMarker.remove();
        }
        // Use a custom marker for user location (no pin symbol)
        const el = document.createElement('div');
        el.className = 'user-location-marker';
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.background = 'radial-gradient(circle at 60% 40%, #4285F4 70%, #fff 100%)';
        el.style.border = '3px solid #fff';
        el.style.borderRadius = '50%';
        el.style.boxShadow = '0 0 12px 2px #4285F4, 0 0 0 4px rgba(66,133,244,0.2)';
        el.style.display = 'block';
        // No innerHTML, so no pin symbol
        window.userLocationMarker = new mapboxgl.Marker(el)
          .setLngLat(coordinates)
          .setPopup(new mapboxgl.Popup().setText("You are here"))
          .addTo(map);
      } else if (map) {
        map.once("load", () => {
          if (window.userLocationMarker) {
            window.userLocationMarker.remove();
          }
          const el = document.createElement('div');
          el.className = 'user-location-marker';
          el.style.width = '32px';
          el.style.height = '32px';
          el.style.background = 'radial-gradient(circle at 60% 40%, #4285F4 70%, #fff 100%)';
          el.style.border = '3px solid #fff';
          el.style.borderRadius = '50%';
          el.style.boxShadow = '0 0 12px 2px #4285F4, 0 0 0 4px rgba(66,133,244,0.2)';
          el.style.display = 'block';
          // No innerHTML, so no pin symbol
          window.userLocationMarker = new mapboxgl.Marker(el)
            .setLngLat(coordinates)
            .setPopup(new mapboxgl.Popup().setText("You are here"))
            .addTo(map);
        });
      }
    }

    // Center map on user location after marker is set
    if (window.mapManager && window.mapManager.getMap) {
      const map = window.mapManager.getMap();
      if (map && map.loaded()) {
        map.flyTo({ center: coordinates, zoom: 16 });
      } else if (map) {
        map.once("load", () => {
          map.flyTo({ center: coordinates, zoom: 16 });
        });
      }
    }

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
  const coords = window.startCoordinates || [window.CONFIG.LOCATION.CENTER.lng, window.CONFIG.LOCATION.CENTER.lat];
  const lat = coords[1], lng = coords[0];
  const date = getDateForTimeStr(timeStr);
  updateNightAlert(lat, lng, date);
  if (shouldShowShadeLayer(lat, lng, date)) {
    await window.shadeSystem.renderShadowsForTime(timeStr);
    window.mapManager.updateShadeMapTime(timeStr);
    window.log("Shadows updated for time:", timeStr);
  } else {
    window.mapManager.removeLayerIfExists("shadows");
    window.log("It's night time, shade layer hidden.");
  }
}

function getDateForTimeStr(timeStr) {
  // Returns a Date object for today with the given HH:MM time
  const [h, m] = timeStr.split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

/**
 * Handle get route button click
 */
async function handleGetRoute() {
  if (!window.startCoordinates || !window.endCoordinates) {
    window.log("Please select both start and destination locations.");
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

      window.log(message);
    } else {
      throw new Error("No valid route coordinates found");
    }
  } catch (error) {
    console.error("Error getting route:", error);
    window.log("Failed to calculate route. Please try again.");
  }
}

/**
 * Handle find shadiest path button click
 */
async function handleFindShadyPath() {
  if (!window.startCoordinates || !window.endCoordinates) {
    window.log("Please select both start and destination locations.");
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
    console.log('[DEBUG] findShadiestPath result:', result);
    window.log(result && result.message ? result.message : '[DEBUG] No result.message');

    // --- New: Calculate water requirement ---
    if (result && result.coordinates && Array.isArray(result.coordinates) && result.coordinates.length > 1) {
      // Calculate distance in km using result.coordinates
      const turfLine = turf.lineString(result.coordinates);
      const distanceKm = turf.length(turfLine, { units: 'kilometers' });
      // Fetch current temperature
      let temperature = 21;
      try {
        temperature = await window.heatSafeChatbot.fetchCurrentTemperature();
      } catch (e) {}
      // Ask Gemini for water requirement
      const waterPrompt = `A person is planning to walk ${distanceKm.toFixed(2)} kilometers from start to end. The current temperature is ${temperature}°C. How much water (in cups, 250ml per cup) should a healthy adult bring to stay hydrated for this trip? Consider both the distance and the temperature. Respond with only the number of cups (rounded up) and a short, clear sentence, e.g. 'You should bring 5 cups of water for this trip.'`;
      console.log('[DEBUG] Water advice prompt:', waterPrompt);
      console.log('[DEBUG] Distance (km):', distanceKm, 'Temperature (C):', temperature);
      let waterAdvice = '';
      try {
        waterAdvice = await window.heatSafeChatbot.callGeminiAPI(waterPrompt, temperature);
        console.log('[DEBUG] Gemini water advice:', waterAdvice);
      } catch (e) {
        waterAdvice = 'Unable to calculate water requirement.';
        console.log('[DEBUG] Gemini error:', e);
      }
      window.log(waterAdvice);
      window.showWaterAdvicePopup(waterAdvice);
    }
    // --- End new ---
  } catch (error) {
    console.error("Error finding shady path:", error);
    window.log("Failed to find shady path. Please try again.");
  }
}

/**
 * Handle show highways button click
 */
async function handleShowHighways() {
  try {
    // If we don't have road network data yet, load it first
    if (!window.roadNetworkData && window.startCoordinates) {
      const routingSystem = new window.RoutingSystem(
        window.mapManager,
        window.shadeSystem,
      );
      console.log("Loading road network data...");
      window.roadNetworkData = await routingSystem.fetchHighwayNetwork({
        lat: window.startCoordinates[1],
        lng: window.startCoordinates[0]
      }, 2);
      console.log("Road network data loaded:", window.roadNetworkData.length, "segments");
    } else if (!window.roadNetworkData) {
      // No start location and no data - use default location
      const routingSystem = new window.RoutingSystem(
        window.mapManager,
        window.shadeSystem,
      );
      console.log("Loading road network data for default location...");
      window.roadNetworkData = await routingSystem.fetchHighwayNetwork(null, 2);
      console.log("Road network data loaded:", window.roadNetworkData.length, "segments");
    }
    
    // Show the visual display
    if (window.roadNetworkData) {
      window.mapManager.renderHighways(window.roadNetworkData);
      window.isRoadNetworkVisible = true;
      window.log("Road network displayed");
      showCloseRoadNetworkButton();
    } else {
      window.log("No road network data available");
    }
  } catch (error) {
    console.error("Error showing road network:", error);
    window.log("Failed to display road network. Please try again.");
  }
}

// Update handleCloseRoadNetwork to only hide the custom road network overlay
function handleCloseRoadNetwork() {
  try {
    // Hide only the custom road network overlay, not all roads
    const map = window.mapManager.getMap();
    if (map) {
      // Only hide the specific 'highways' layer that we added for the road network visualization
      if (map.getLayer && map.getLayer('highways')) {
        map.setLayoutProperty('highways', 'visibility', 'none');
        console.log('Custom highway layer hidden');
      }
      
      // Remove the highways source if it exists (this is our custom overlay)
      if (map.getSource && map.getSource('highways')) {
        try {
          // First hide all layers using this source
          const layers = map.getStyle().layers;
          layers.forEach(layer => {
            if (layer.source === 'highways') {
              map.setLayoutProperty(layer.id, 'visibility', 'none');
              console.log(`Custom layer ${layer.id} hidden`);
            }
          });
        } catch (e) {
          console.log('Could not hide some custom layers');
        }
      }
      
      // DO NOT hide base map roads - they should stay visible
      // The base map roads are part of the map style and should not be touched
    }
    
    window.isRoadNetworkVisible = false;
    window.log("Road network overlay hidden (base map roads remain visible)");
    
    // Hide the close button
    hideCloseRoadNetworkButton();
  } catch (error) {
    console.error("Error hiding road network:", error);
    window.log("Failed to hide road network.");
  }
}

/**
 * Show the close road network button
 */
function showCloseRoadNetworkButton() {
  // Remove any existing button first
  const existingBtn = document.getElementById('close-road-network-btn');
  if (existingBtn) {
    existingBtn.remove();
  }

  // Create new button
  const closeBtn = document.createElement('button');
  closeBtn.id = 'close-road-network-btn';
  closeBtn.textContent = '✕ Hide Road Network';
  closeBtn.style.cssText = `
    position: fixed !important;
    top: 20px !important;
    left: 20px !important;
    z-index: 1000 !important;
    padding: 10px 15px !important;
    background: #dc3545 !important;
    color: white !important;
    border: none !important;
    border-radius: 5px !important;
    cursor: pointer !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3) !important;
    transition: all 0.2s ease !important;
    display: block !important;
  `;
  
  // Add hover effects
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.background = '#c82333';
    closeBtn.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.4)';
    closeBtn.style.transform = 'translateY(-1px)';
  });
  
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.background = '#dc3545';
    closeBtn.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.3)';
    closeBtn.style.transform = 'translateY(0)';
  });
  
  // Add click handler
  closeBtn.addEventListener('click', handleCloseRoadNetwork);
  
  // Add to page
  document.body.appendChild(closeBtn);
  
  console.log('Close road network button created and added');
}

/**
 * Hide the close road network button
 */
function hideCloseRoadNetworkButton() {
  const closeBtn = document.getElementById('close-road-network-btn');
  if (closeBtn) {
    closeBtn.remove();
    console.log('Close road network button removed');
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
      const coords = window.startCoordinates || [window.CONFIG.LOCATION.CENTER.lng, window.CONFIG.LOCATION.CENTER.lat];
      const lat = coords[1], lng = coords[0];
      const date = getDateForTimeStr(currentTime);
      updateNightAlert(lat, lng, date);
      // Only update shade map during day time
      if (shouldShowShadeLayer(lat, lng, date)) {
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
 * Initialize Heat Safety Chatbot
 */
function initializeChatbot() {
  window.heatSafeChatbot = new window.HeatSafeChatbot();

  // Integrate with main app components
  if (window.mapManager) {
    window.heatSafeChatbot.integrateWithApp(
      window.mapManager,
      window.RoutingSystem,
    );
  }

  window.log("Heat Safety Chatbot initialized");
}

/**
 * Utility: Show a custom popup (modal) for water advice
 */
window.showWaterAdvicePopup = function(message) {
  // Remove any existing popup
  const existing = document.getElementById('water-advice-popup');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.id = 'water-advice-popup';
  popup.style.position = 'fixed';
  popup.style.left = '50%';
  popup.style.top = '20%';
  popup.style.transform = 'translate(-50%, 0)';
  popup.style.background = 'white';
  popup.style.border = '2px solid #34c759';
  popup.style.borderRadius = '12px';
  popup.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
  popup.style.padding = '28px 32px 20px 32px';
  popup.style.zIndex = 9999;
  popup.style.fontSize = '1.2rem';
  popup.style.textAlign = 'center';
  popup.style.maxWidth = '90vw';
  popup.innerHTML = `<div style='font-size:2.2rem;margin-bottom:10px;'>💧</div><div>${message}</div><button id='close-water-advice' style='margin-top:18px;padding:8px 22px;font-size:1rem;background:#34c759;color:white;border:none;border-radius:6px;cursor:pointer;'>OK</button>`;
  document.body.appendChild(popup);
  document.getElementById('close-water-advice').onclick = () => popup.remove();
};

/**
 * Main initialization function
 */
async function initializeApp() {
  try {
    window.log("Initializing Shade Navigation App...");

    // --- Always check and show night alert on reload or site entry ---
    const now = new Date();
    let initialCoords = [window.CONFIG.LOCATION.CENTER.lng, window.CONFIG.LOCATION.CENTER.lat];
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          });
        });
        initialCoords = [position.coords.longitude, position.coords.latitude];
      } catch (e) {}
    }
    updateNightAlert(initialCoords[1], initialCoords[0], now);
    // --- End always check night alert ---

    // Get user location first
    let userCoordinates = null;
    if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          });
        });
        userCoordinates = [position.coords.longitude, position.coords.latitude];
        window.startCoordinates = userCoordinates;
      } catch (e) {
        window.log("Could not get user location, defaulting to TMU");
      }
    }

    // Initialize map manager, centered on user if available
    window.mapManager = new window.MapManager();
    await window.mapManager.initialize(userCoordinates);

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

    // Update the autocomplete event handler to automatically load road network data
    window.startAutocomplete.onLocationSelected = async (coordinates, placeName) => {
      window.startCoordinates = coordinates;
      window.updateButtonStates();
      
      // Always load road network data when start location changes
      try {
        const routingSystem = new window.RoutingSystem(
          window.mapManager,
          window.shadeSystem,
        );
        console.log("Loading road network data for new start location...");
        window.roadNetworkData = await routingSystem.fetchHighwayNetwork({
          lat: coordinates[1],
          lng: coordinates[0]
        }, 2);
        console.log("Road network data loaded:", window.roadNetworkData.length, "segments");
        window.log(`Road network data loaded (${window.roadNetworkData.length} segments)`);
        
        // If road network is currently visible, update the display
        if (window.isRoadNetworkVisible) {
          window.mapManager.renderHighways(window.roadNetworkData);
          window.log("Road network display updated for new location");
        }
      } catch (error) {
        console.error("Error loading road network data:", error);
        window.roadNetworkData = null;
      }
    };

    window.endAutocomplete.onLocationSelected = (coordinates, placeName) => {
      window.endCoordinates = coordinates;
      window.updateButtonStates();
    };

    // Initialize chatbot
    initializeChatbot();

    // Initialize time controls
    initializeTimeControls();

    // Set up event listeners
    document
      .getElementById("update-shadows")
      .addEventListener("click", handleUpdateShadows); // Keep this - button is just hidden
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
        const coords = window.startCoordinates || [window.CONFIG.LOCATION.CENTER.lng, window.CONFIG.LOCATION.CENTER.lat];
        const lat = coords[1], lng = coords[0];
        const date = getDateForTimeStr(timeStr);
        updateNightAlert(lat, lng, date);
        if (
          window.ValidationUtils.isValidTime(timeStr) &&
          window.mapManager.isMapLoaded()
        ) {
          if (shouldShowShadeLayer(lat, lng, date)) {
            await window.shadeSystem.renderShadowsForTime(timeStr);
            window.mapManager.updateShadeMapTime(timeStr);
          }
        }
      });

    // Initialize user location
    await initializeUserLocation();

    // Handle map load events
    window.mapManager.getMap().on("load", async () => {
      try {
        // Initialize buildings and shadows
        await window.shadeSystem.initializeBuildingsCache();
        const coords = window.startCoordinates || [window.CONFIG.LOCATION.CENTER.lng, window.CONFIG.LOCATION.CENTER.lat];
        const lat = coords[1], lng = coords[0];
        const defaultTime = window.CONFIG.UI.DEFAULT_TIME;
        const date = getDateForTimeStr(defaultTime);
        updateNightAlert(lat, lng, date);
        if (shouldShowShadeLayer(lat, lng, date)) {
          await window.shadeSystem.renderShadowsForTime(defaultTime);
          window.mapManager.updateShadeMapTime(defaultTime);
        }
        // Initialize POIs
        await initializePOIs();

        // --- Add moveend event handler to prevent shade rendering at night ---
        const map = window.mapManager.getMap();
        map.on('moveend', async () => {
          const center = map.getCenter();
          const lat = center.lat;
          const lng = center.lng;
          const timeStr = document.getElementById("sun-time").value || window.CONFIG.UI.DEFAULT_TIME;
          const date = getDateForTimeStr(timeStr);
          updateNightAlert(lat, lng, date);
          // Only update shade map during day time
          if (shouldShowShadeLayer(lat, lng, date)) {
            await window.shadeSystem.renderShadowsForTime(timeStr);
            window.mapManager.updateShadeMapTime(timeStr);
          }
        });
        // --- End moveend handler ---

        window.log("Map fully loaded and initialized");
      } catch (error) {
        console.error("Error during map load:", error);
      }
    });

    // --- Prevent shade map from being drawn/reset on map move at night ---
    const map = window.mapManager.getMap();
    if (map) {
      map.on("moveend", async () => {
        const coords = window.startCoordinates || [window.CONFIG.LOCATION.CENTER.lng, window.CONFIG.LOCATION.CENTER.lat];
        const lat = coords[1], lng = coords[0];
        const timeStr = document.getElementById("sun-time")?.value || window.TimeUtils.getCurrentTime();
        const date = getDateForTimeStr(timeStr);
        updateNightAlert(lat, lng, date);
        // Only update shade map during day time
        if (shouldShowShadeLayer(lat, lng, date)) {
          await window.shadeSystem.renderShadowsForTime(timeStr);
          window.mapManager.updateShadeMapTime(timeStr);
        }
      });
    }
    // --- End prevent shade map on move at night ---

    // Update initial button states
    window.updateButtonStates();

    window.log("Shade Navigation App initialized successfully");
  } catch (error) {
    console.error("Failed to initialize application:", error);
    alert("Failed to initialize the application. Please refresh the page.");
  }
}

// Add recenter and chatbot button container to map after map is initialized
function addFloatingButtonContainer() {
  const map = window.mapManager && window.mapManager.getMap && window.mapManager.getMap();
  if (!map) return;
  let container = document.getElementById('floating-btn-container');
  if (container) container.remove();
  container = document.createElement('div');
  container.id = 'floating-btn-container';
  container.style.position = 'absolute';
  container.style.bottom = '32px';
  container.style.right = '32px';
  container.style.zIndex = 1001;
  container.style.display = 'flex';
  container.style.flexDirection = 'row';
  container.style.gap = '16px';

  // Recenter button
  let recenterBtn = document.getElementById('recenter-btn');
  if (recenterBtn) recenterBtn.remove();
  recenterBtn = document.createElement('button');
  recenterBtn.id = 'recenter-btn';
  recenterBtn.title = 'Recenter map on your location';
  recenterBtn.style.background = '#4285F4';
  recenterBtn.style.color = '#fff';
  recenterBtn.style.border = 'none';
  recenterBtn.style.borderRadius = '50%';
  recenterBtn.style.width = '56px';
  recenterBtn.style.height = '56px';
  recenterBtn.style.boxShadow = '0 2px 8px rgba(66,133,244,0.2)';
  recenterBtn.style.fontSize = '2rem';
  recenterBtn.style.cursor = 'pointer';
  recenterBtn.innerHTML = '📍';
  recenterBtn.onclick = function() {
    if (window.userLocationMarker && window.userLocationMarker.getLngLat) {
      const lngLat = window.userLocationMarker.getLngLat();
      map.flyTo({ center: [lngLat.lng, lngLat.lat], zoom: 16 });
      if (window.userLocationMarker.togglePopup) window.userLocationMarker.togglePopup();
    }
  };
  container.appendChild(recenterBtn);

  // Move chatbot FAB into the container if it exists
  const fab = document.getElementById('heat-ai-fab');
  if (fab) {
    fab.style.position = 'static';
    fab.style.margin = '0';
    fab.style.width = '56px';
    fab.style.height = '56px';
    fab.style.display = 'flex';
    fab.style.alignItems = 'center';
    fab.style.justifyContent = 'center';
    fab.style.background = '#ff9800';
    fab.style.color = '#fff';
    fab.style.borderRadius = '50%';
    fab.style.boxShadow = '0 2px 8px rgba(255,152,0,0.2)';
    fab.style.fontSize = '2rem';
    fab.style.cursor = 'pointer';
    container.appendChild(fab);
  }

  map.getContainer().appendChild(container);
}

// Call addFloatingButtonContainer after map is initialized
const oldInitApp = initializeApp;
initializeApp = async function() {
  await oldInitApp();
  addFloatingButtonContainer();
};

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", initializeApp);

/**
 * Utility function to determine if shade layer should be shown based on time and location
 */
function shouldShowShadeLayer(lat, lng, date = new Date()) {
  return !window.isNightTime(lat, lng, date);
}

// Utility to show/hide the night alert
function updateNightAlert(lat, lng, date = new Date()) {
  let alert = document.getElementById('night-alert');
  if (!alert) {
    alert = document.createElement('div');
    alert.id = 'night-alert';
    alert.className = 'night-alert';
    alert.style.display = 'none';
    document.body.appendChild(alert);
  }
  if (window.isNightTime(lat, lng, date)) {
    console.log("[DEBUG] Night time detected - showing alert and hiding shade");
    alert.textContent = "🌙 It's currently night time. There is no shade available.";
    alert.style.display = 'block';
    // Set shade layer opacity to 0 when it's night
    if (window.mapManager && window.mapManager.getMap) {
      const mapboxMap = window.mapManager.getMap();
      
      // Debug: List all available layers
      if (mapboxMap && mapboxMap.getStyle) {
        const style = mapboxMap.getStyle();
        if (style && style.layers) {
          const layerIds = style.layers.map(layer => layer.id);
          console.log("[DEBUG] All available layers:", layerIds);
          const shadowLayers = layerIds.filter(id => id.includes('shade') || id.includes('shadow'));
          console.log("[DEBUG] Shadow-related layers:", shadowLayers);
        }
      }
      
      if (mapboxMap && mapboxMap.getLayer && mapboxMap.getLayer('shadows')) {
        console.log("[DEBUG] Setting shade layer opacity to 0 (night time)");
        mapboxMap.setPaintProperty('shadows', 'fill-opacity', 0);
        console.log("[DEBUG] Shade layer opacity set to 0");
      } else {
        console.log("[DEBUG] No shadows layer found to hide");
        // Try to hide ShadeMap directly if it exists
        if (window.mapManager.shadeMap) {
          console.log("[DEBUG] Found ShadeMap instance, trying to hide it");
          // ShadeMap might have its own opacity control
          try {
            window.mapManager.shadeMap.setOpacity(0);
            console.log("[DEBUG] ShadeMap opacity set to 0");
          } catch (e) {
            console.log("[DEBUG] ShadeMap.setOpacity not available, trying alternative methods");
            // Alternative: try to hide the ShadeMap layers directly
            if (mapboxMap && mapboxMap.getStyle) {
              const style = mapboxMap.getStyle();
              if (style && style.layers) {
                style.layers.forEach(layer => {
                  if (layer.id.includes('shade') || layer.id.includes('shadow')) {
                    try {
                      mapboxMap.setLayoutProperty(layer.id, 'visibility', 'none');
                      console.log(`[DEBUG] Hid layer: ${layer.id}`);
                    } catch (err) {
                      console.log(`[DEBUG] Could not hide layer ${layer.id}:`, err);
                    }
                  }
                });
              }
            }
          }
        } else {
          console.log("[DEBUG] No ShadeMap instance found");
        }
      }
    } else {
      console.log("[DEBUG] Map or mapManager not available");
    }
  } else {
    console.log("[DEBUG] Day time detected - hiding alert and showing shade");
    alert.style.display = 'none';
    // Restore shade layer opacity and re-render shadows when it becomes day
    if (window.mapManager && window.mapManager.getMap && window.shadeSystem) {
      const mapboxMap = window.mapManager.getMap();
      
      if (mapboxMap && mapboxMap.getLayer && mapboxMap.getLayer('shadows')) {
        console.log("[DEBUG] Setting shade layer opacity to 0.5 (day time)");
        mapboxMap.setPaintProperty('shadows', 'fill-opacity', 0.5);
        console.log("[DEBUG] Shade layer opacity set to 0.5");
      } else {
        console.log("[DEBUG] No shadows layer found to restore");
        // Try to show ShadeMap directly if it exists
        if (window.mapManager.shadeMap) {
          console.log("[DEBUG] Found ShadeMap instance, trying to show it");
          try {
            window.mapManager.shadeMap.setOpacity(window.CONFIG.SHADE_MAP.OPACITY);
            console.log("[DEBUG] ShadeMap opacity restored to", window.CONFIG.SHADE_MAP.OPACITY);
          } catch (e) {
            console.log("[DEBUG] ShadeMap.setOpacity not available, trying alternative methods");
            // Alternative: try to show the ShadeMap layers directly
            if (mapboxMap && mapboxMap.getStyle) {
              const style = mapboxMap.getStyle();
              if (style && style.layers) {
                style.layers.forEach(layer => {
                  if (layer.id.includes('shade') || layer.id.includes('shadow')) {
                    try {
                      mapboxMap.setLayoutProperty(layer.id, 'visibility', 'visible');
                      console.log(`[DEBUG] Showed layer: ${layer.id}`);
                    } catch (err) {
                      console.log(`[DEBUG] Could not show layer ${layer.id}:`, err);
                    }
                  }
                });
              }
            }
          }
        } else {
          console.log("[DEBUG] No ShadeMap instance found for day time");
        }
      }
      
      // Re-render shadows for current time when transitioning from night to day
      const timeStr = document.getElementById("sun-time")?.value || window.TimeUtils?.getCurrentTime() || "12:00";
      console.log("[DEBUG] Re-rendering shadows for time:", timeStr);
      if (window.shadeSystem.renderShadowsForTime) {
        window.shadeSystem.renderShadowsForTime(timeStr);
        if (window.mapManager.updateShadeMapTime) {
          window.mapManager.updateShadeMapTime(timeStr);
        }
        console.log("[DEBUG] Shadows re-rendered for day time");
      }
    } else {
      console.log("[DEBUG] Map, mapManager, or shadeSystem not available for day time rendering");
    }
  }
}
