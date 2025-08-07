/**
 * Map Manager - Handles all map-related functionality
 */

window.MapManager = class {
  constructor() {
    this.map = null;
    this.shadeMap = null;
    this.isLoaded = false;
    this.markers = {
      fountains: [],
      benches: [],
      washrooms: [],
    };
  }

  /**
   * Initialize the map
   * @param {Array} initialCenter - [lng, lat] to center the map on (optional)
   */
  async initialize(initialCenter) {
    try {
      // Set Mapbox access token
      mapboxgl.accessToken = window.CONFIG.MAPBOX.API_KEY;

      // Use provided center or fallback to config
      const center = initialCenter || [
        window.CONFIG.LOCATION.CENTER.lng,
        window.CONFIG.LOCATION.CENTER.lat,
      ];

      // Create map instance
      this.map = new mapboxgl.Map({
        container: "map",
        style: window.CONFIG.MAPBOX.STYLE,
        center: center,
        zoom: window.CONFIG.MAPBOX.DEFAULT_ZOOM,
      });

      // Set up event listeners
      this.setupEventListeners();

      window.log("Map initialized successfully");
      return this.map;
    } catch (error) {
      console.error("Failed to initialize map:", error);
      throw error;
    }
  }

  /**
   * Set up map event listeners
   */
  setupEventListeners() {
    this.map.on("load", () => {
      this.isLoaded = true;
      this.onMapLoad();
      // Ensure building and place label layers are visible
      this.showBuildingAndPlaceLabels();
    });

    this.map.on("style.load", () => {
      this.onStyleLoad();
      // Ensure building and place label layers are visible after style reload
      this.showBuildingAndPlaceLabels();
    });

    // Remove default POI and place labels for cleaner map
    // this.map.on("style.load", () => {
    //   const layers = this.map.getStyle().layers;
    //   if (layers) {
    //     layers.forEach((layer) => {
    //       if (layer.type === "symbol") {
    //         try {
    //           this.map.removeLayer(layer.id);
    //         } catch (e) {
    //           // Layer might already be removed, ignore error
    //         }
    //       }
    //     });
    //   }
    // });
  }

  /**
   * Handle map load event
   */
  async onMapLoad() {
    try {
      await this.initializeShadeMap();
      window.log("Map and ShadeMap loaded successfully");
    } catch (error) {
      console.error("Error during map load:", error);
    }
  }

  /**
   * Handle style load event
   */
  onStyleLoad() {
    this.reAddAllMarkers();
  }

  /**
   * Initialize ShadeMap with current time
   */
  async initializeShadeMap() {
    try {
      // Check if ShadeMap is available
      if (typeof ShadeMap === "undefined") {
        console.warn(
          "ShadeMap library not loaded - shadows will use fallback system",
        );
        return;
      }

      this.shadeMap = new ShadeMap({
        apiKey: window.CONFIG.SHADE_MAP.API_KEY,
        date: window.TimeUtils.createDateFromTime(
          window.TimeUtils.getCurrentTime(),
        ),
        color: window.CONFIG.SHADE_MAP.COLOR,
        opacity: window.CONFIG.SHADE_MAP.OPACITY,
        terrainSource: window.CONFIG.SHADE_MAP.TERRAIN_CONFIG,
        getFeatures: async () => {
          await new Promise((resolve) => this.map.once("render", resolve));
          const buildingData = this.map
            .querySourceFeatures("composite", { sourceLayer: "building" })
            .filter((feature) => {
              return (
                feature.properties &&
                feature.properties.underground !== "true" &&
                (feature.properties.height || feature.properties.render_height)
              );
            });
          return buildingData;
        },
        debug: (msg) => window.log(`ShadeMap: ${msg}`),
      }).addTo(this.map);

      // Check if it's night time on initial render and hide shade if needed
      setTimeout(() => {
        const center = this.map.getCenter();
        const lat = center.lat;
        const lng = center.lng;
        console.log("[DEBUG] Initial night time check on map load");
        if (window.isNightTime && window.isNightTime(lat, lng)) {
          console.log("[DEBUG] Initial load: Night time detected, hiding ShadeMap");
          try {
            this.shadeMap.setOpacity(0);
            console.log("[DEBUG] Initial load: ShadeMap opacity set to 0");
          } catch (e) {
            console.log("[DEBUG] Initial load: Could not set ShadeMap opacity:", e);
          }
        } else {
          console.log("[DEBUG] Initial load: Day time detected, ShadeMap visible");
        }
      }, 1000); // Small delay to ensure everything is loaded

      window.log("ShadeMap initialized successfully");
    } catch (error) {
      console.error("Failed to initialize ShadeMap:", error);
      window.log("ShadeMap failed - using fallback shadow system");
    }
  }

  /**
   * Update ShadeMap with new time
   */
  updateShadeMapTime(timeStr) {
    if (this.shadeMap && window.ValidationUtils.isValidTime(timeStr)) {
      try {
        const date = window.TimeUtils.createDateFromTime(timeStr);
        this.shadeMap.setDate(date);
        window.log(`ShadeMap time updated to: ${timeStr}`);
      } catch (error) {
        console.error("Error updating ShadeMap time:", error);
      }
    }
  }

  /**
   * Add or update a data source
   */
  addOrUpdateSource(sourceId, data) {
    try {
      if (this.map.getSource(sourceId)) {
        this.map.getSource(sourceId).setData(data);
      } else {
        this.map.addSource(sourceId, {
          type: "geojson",
          data: data,
        });
      }
    } catch (error) {
      console.error(`Error adding/updating source ${sourceId}:`, error);
    }
  }

  /**
   * Add a layer if it doesn't exist
   */
  addLayerIfNotExists(layerConfig) {
    try {
      if (!this.map.getLayer(layerConfig.id)) {
        this.map.addLayer(layerConfig);
      }
    } catch (error) {
      console.error(`Error adding layer ${layerConfig.id}:`, error);
    }
  }

  /**
   * Remove a layer if it exists
   */
  removeLayerIfExists(layerId) {
    try {
      if (this.map.getLayer(layerId)) {
        this.map.removeLayer(layerId);
      }
      if (this.map.getSource(layerId)) {
        this.map.removeSource(layerId);
      }
    } catch (error) {
      console.error(`Error removing layer/source ${layerId}:`, error);
    }
  }

  /**
   * Render route on map
   */
  renderRoute(coordinates, color = "#e400ff", width = 5) {
    try {
      const routeGeoJSON = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: coordinates,
            },
            properties: {},
          },
        ],
      };

      this.addOrUpdateSource("route", routeGeoJSON);

      this.addLayerIfNotExists({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": color,
          "line-width": width,
          "line-opacity": 0.8,
        },
      });

      window.log("Route rendered on map");
    } catch (error) {
      console.error("Error rendering route:", error);
    }
  }

  /**
   * Render highway network
   */
  renderHighways(features) {
    try {
      const geojson = {
        type: "FeatureCollection",
        features: features,
      };

      this.addOrUpdateSource("highways", geojson);

      this.addLayerIfNotExists({
        id: "highways",
        type: "line",
        source: "highways",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#ff6600",
          "line-width": 2,
        },
      });

      window.log("Highway network rendered");
    } catch (error) {
      console.error("Error rendering highways:", error);
    }
  }

  /**
   * Render shady path
   */
  renderShadyPath(coordinates) {
    try {
      const pathGeoJSON = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: coordinates,
            },
            properties: {},
          },
        ],
      };

      this.addOrUpdateSource("shady-path", pathGeoJSON);

      this.addLayerIfNotExists({
        id: "shady-path",
        type: "line",
        source: "shady-path",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#0093ff",
          "line-width": 6,
          "line-opacity": 0.9,
        },
      });

      window.log("Shady path rendered");
    } catch (error) {
      console.error("Error rendering shady path:", error);
    }
  }

  /**
   * Add marker to map
   */
  addMarker(coordinates, options = {}) {
    try {
      const marker = new mapboxgl.Marker(options).setLngLat(coordinates);

      if (options.popup) {
        marker.setPopup(new mapboxgl.Popup().setText(options.popup));
      }

      marker.addTo(this.map);
      return marker;
    } catch (error) {
      console.error("Error adding marker:", error);
      return null;
    }
  }

  /**
   * Clear markers of specific type
   */
  clearMarkers(type) {
    if (this.markers[type]) {
      this.markers[type].forEach((marker) => marker.remove());
      this.markers[type] = [];
    }
  }

  /**
   * Add POI markers
   */
  addPOIMarkers(type, data, markerOptions) {
    this.clearMarkers(type);

    const tmuCenter = [
      window.CONFIG.LOCATION.CENTER.lng,
      window.CONFIG.LOCATION.CENTER.lat,
    ];

    data.forEach((item) => {
      const lon = item.longitude || item.lon || item.lng;
      const lat = item.latitude || item.lat;

      if (typeof lon !== "number" || typeof lat !== "number") return;

      const distance = this.calculateDistance(tmuCenter, [lon, lat]);

      if (distance <= window.CONFIG.LOCATION.POI_SEARCH_RADIUS) {
        let popupText = markerOptions.popup;
        if (typeof popupText === "function") {
          popupText = popupText(item);
        }

        const marker = this.addMarker([lon, lat], {
          color: markerOptions.color,
          popup: popupText,
        });

        if (marker) {
          this.markers[type].push(marker);
        }
      }
    });

    window.log(`Added ${this.markers[type].length} ${type} markers`);
  }

  /**
   * Calculate distance between two points
   */
  calculateDistance(coord1, coord2) {
    return window.GeoUtils.haversine(
      coord1[0],
      coord1[1],
      coord2[0],
      coord2[1],
    );
  }

  /**
   * Re-add all markers after style change
   */
  reAddAllMarkers() {
    // This will be called by POI manager
    window.log("Re-adding markers after style reload");
  }

  /**
   * Show building and place label layers on the map
   */
  showBuildingAndPlaceLabels() {
    const map = this.map;
    if (!map || !map.getStyle) return;
    const style = map.getStyle();
    if (!style || !style.layers) return;
    style.layers.forEach((layer) => {
      // Show symbol layers for labels (buildings, places, POIs)
      if (layer.type === "symbol" &&
          (layer.id.includes("label") || layer.id.includes("place") || layer.id.includes("building"))) {
        try {
          map.setLayoutProperty(layer.id, "visibility", "visible");
        } catch (e) {
          // Ignore errors for non-toggleable layers
        }
      }
    });
  }

  /**
   * Get map instance
   */
  getMap() {
    return this.map;
  }

  /**
   * Check if map is loaded
   */
  isMapLoaded() {
    return this.isLoaded;
  }

  /**
   * Fit map to bounds
   */
  fitToBounds(coordinates) {
    try {
      if (coordinates && coordinates.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        coordinates.forEach((coord) => bounds.extend(coord));
        this.map.fitBounds(bounds, { padding: 50 });
      }
    } catch (error) {
      console.error("Error fitting to bounds:", error);
    }
  }
};
