/**
 * POI (Points of Interest) Manager - Handles fountains, benches, washrooms
 */

window.POIManager = class {
  constructor(mapManager) {
    this.mapManager = mapManager;
    this.isInitialized = false;
  }

  /**
   * Initialize POI manager and load all POIs
   */
  async initialize() {
    try {
      await Promise.all([
        this.loadFountains(),
        this.loadBenches(),
        this.loadWashrooms(),
      ]);

      this.isInitialized = true;
      window.log("POI Manager initialized successfully");
    } catch (error) {
      console.error("Error initializing POI Manager:", error);
    }
  }

  /**
   * Fetch and display fountains
   */
  async loadFountains() {
    try {
      const data = await window.APIUtils.request(
        `${window.CONFIG.API.BASE_URL}/fountains`,
      );

      const markerOptions = {
        color: "#00bfff",
        popup: this.createFountainPopupText.bind(this),
      };

      this.mapManager.addPOIMarkers("fountains", data, markerOptions);
      window.log(`Loaded ${data.length} fountains`);
    } catch (error) {
      console.error("Error loading fountains:", error);
    }
  }

  /**
   * Fetch and display benches
   */
  async loadBenches() {
    try {
      const data = await window.APIUtils.request(
        `${window.CONFIG.API.BASE_URL}/benches`,
      );

      const markerOptions = {
        color: "#964B00",
        popup: "Bench",
      };

      this.mapManager.addPOIMarkers("benches", data, markerOptions);
      window.log(`Loaded ${data.length} benches`);
    } catch (error) {
      console.error("Error loading benches:", error);
    }
  }

  /**
   * Fetch and display washrooms
   */
  async loadWashrooms() {
    try {
      const data = await window.APIUtils.request(
        `${window.CONFIG.API.BASE_URL}/washrooms`,
      );

      const markerOptions = {
        color: "#228B22",
        popup: this.createWashroomPopupText.bind(this),
      };

      this.mapManager.addPOIMarkers("washrooms", data, markerOptions);
      window.log(`Loaded ${data.length} washrooms`);
    } catch (error) {
      console.error("Error loading washrooms:", error);
    }
  }

  /**
   * Create popup text for fountains
   */
  createFountainPopupText(fountain) {
    let popupText = "Fountain";

    if (fountain.type) {
      popupText += `\nType: ${fountain.type}`;
    }

    if (fountain.description) {
      popupText += `\nDescription: ${fountain.description}`;
    }

    return popupText;
  }

  /**
   * Create popup text for washrooms
   */
  createWashroomPopupText(washroom) {
    let popupText = "Washroom";

    popupText += `\nHours: ${washroom.hours || "N/A"}`;
    popupText += `\nDescription: ${washroom.description || "N/A"}`;

    if (washroom.accessibility) {
      popupText += `\nAccessible: ${washroom.accessibility}`;
    }

    return popupText;
  }

  /**
   * Reload all POIs (called after map style changes)
   */
  async reloadAll() {
    if (this.isInitialized) {
      await this.initialize();
      window.log("POIs reloaded after map style change");
    }
  }

  /**
   * Toggle visibility of specific POI type
   */
  togglePOIVisibility(type, visible) {
    if (this.mapManager.markers[type]) {
      this.mapManager.markers[type].forEach((marker) => {
        if (visible) {
          marker.addTo(this.mapManager.getMap());
        } else {
          marker.remove();
        }
      });
      window.log(`${type} markers ${visible ? "shown" : "hidden"}`);
    }
  }

  /**
   * Get POIs within radius of coordinates
   */
  getPOIsNearLocation(
    coordinates,
    radius = window.CONFIG.LOCATION.POI_SEARCH_RADIUS,
    type = null,
  ) {
    const nearbyPOIs = [];
    const typesToCheck = type ? [type] : ["fountains", "benches", "washrooms"];

    typesToCheck.forEach((poiType) => {
      if (this.mapManager.markers[poiType]) {
        this.mapManager.markers[poiType].forEach((marker) => {
          const markerCoords = [marker.getLngLat().lng, marker.getLngLat().lat];
          const distance = this.mapManager.calculateDistance(
            coordinates,
            markerCoords,
          );

          if (distance <= radius) {
            nearbyPOIs.push({
              type: poiType,
              coordinates: markerCoords,
              distance: distance,
              marker: marker,
            });
          }
        });
      }
    });

    return nearbyPOIs.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Clear all POI markers
   */
  clearAll() {
    ["fountains", "benches", "washrooms"].forEach((type) => {
      this.mapManager.clearMarkers(type);
    });
    window.log("All POI markers cleared");
  }
};
