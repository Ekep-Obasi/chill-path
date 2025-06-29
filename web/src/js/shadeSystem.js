/**
 * Shade System - Handles building shadows and shade calculations
 */

window.ShadeSystem = class {
  constructor(mapManager) {
    this.mapManager = mapManager;
    this.buildingsCache = null;
    this.lastShadowPolygons = [];
  }

  /**
   * Get building height from tags
   */
  getBuildingHeight(tags) {
    if (tags && tags.height) {
      return parseFloat(tags.height);
    }
    if (tags && tags["building:levels"]) {
      return (
        parseFloat(tags["building:levels"]) *
        window.CONFIG.PATHFINDING.BUILDING_LEVEL_HEIGHT
      );
    }
    return window.CONFIG.PATHFINDING.MIN_BUILDING_HEIGHT;
  }

  /**
   * Calculate shadow polygon for a building
   */
  getBuildingShadowPolygon(footprint, height, sunAzimuth, sunAltitude) {
    if (sunAltitude <= 0 || !window.turf) {
      return null;
    }

    try {
      const shadowLength = height / Math.tan(sunAltitude);
      const shadowAzimuthDeg = (sunAzimuth * 180) / Math.PI - 180;

      const shadowedPoints = footprint.map(([lng, lat]) => {
        const point = turf.point([lng, lat]);
        const destination = turf.destination(
          point,
          shadowLength,
          shadowAzimuthDeg,
          {
            units: "meters",
          },
        );
        return destination.geometry.coordinates;
      });

      // Create shadow polygon by combining original footprint with shadow
      const ring = [...footprint, ...shadowedPoints.reverse()];

      // Ensure the ring is closed
      if (
        ring.length &&
        (ring[0][0] !== ring[ring.length - 1][0] ||
          ring[0][1] !== ring[ring.length - 1][1])
      ) {
        ring.push(ring[0]);
      }

      return turf.polygon([ring]);
    } catch (error) {
      console.error("Error creating shadow polygon:", error);
      return null;
    }
  }

  /**
   * Get all building shadows for current sun position
   */
  getBuildingShadows(buildings, sunPosition) {
    return buildings
      .map((building) => {
        const height = this.getBuildingHeight(building.tags);
        return this.getBuildingShadowPolygon(
          building.footprint,
          height,
          sunPosition.azimuth,
          sunPosition.altitude,
        );
      })
      .filter(Boolean);
  }

  /**
   * Check if a point is in shade
   */
  isPointShaded(coordinates, shadowPolygons = this.lastShadowPolygons) {
    if (!window.turf || shadowPolygons.length === 0) {
      return false;
    }

    try {
      const point = turf.point(coordinates);
      return shadowPolygons.some((polygon) =>
        turf.booleanPointInPolygon(point, polygon),
      );
    } catch (error) {
      console.error("Error checking if point is shaded:", error);
      return false;
    }
  }

  /**
   * Calculate shade penalty for a path segment
   */
  getShadePenalty(
    fromCoord,
    toCoord,
    shadowPolygons = this.lastShadowPolygons,
    samples = window.CONFIG.PATHFINDING.SHADOW_SAMPLE_COUNT,
  ) {
    if (!window.turf || shadowPolygons.length === 0) {
      return 1; // No penalty if no shadows
    }

    try {
      const line = turf.lineString([fromCoord, toCoord]);
      const lineLength = turf.length(line);
      let shadedPoints = 0;

      for (let i = 0; i <= samples; i++) {
        const point = turf.along(line, (lineLength * i) / samples);
        if (this.isPointShaded(point.geometry.coordinates, shadowPolygons)) {
          shadedPoints++;
        }
      }

      const shadeRatio = shadedPoints / (samples + 1);
      return (
        1 + window.CONFIG.PATHFINDING.SHADE_WEIGHT_MULTIPLIER * (1 - shadeRatio)
      );
    } catch (error) {
      console.error("Error calculating shade penalty:", error);
      return 1;
    }
  }

  /**
   * Fetch building data from OpenStreetMap Overpass API
   */
  async fetchBuildings(bbox) {
    try {
      const [west, south, east, north] = bbox;
      const query = `
        [out:json][timeout:25];
        (
          way["building"](${south},${west},${north},${east});
        );
        (._;>;);
        out body;
      `;

      const response = await fetch(window.CONFIG.API.OVERPASS_URL, {
        method: "POST",
        body: query,
        headers: { "Content-Type": "text/plain" },
      });

      if (!response.ok) {
        throw new Error(`Overpass API error: ${response.status}`);
      }

      const data = await response.json();
      return this.processOSMData(data);
    } catch (error) {
      console.error("Error fetching buildings:", error);
      return [];
    }
  }

  /**
   * Process OpenStreetMap data into building objects
   */
  processOSMData(data) {
    const nodes = {};
    const buildings = [];

    // First pass: collect all nodes
    for (const element of data.elements) {
      if (element.type === "node") {
        nodes[element.id] = [element.lon, element.lat];
      }
    }

    // Second pass: process ways (buildings)
    for (const element of data.elements) {
      if (element.type === "way" && element.nodes && element.nodes.length > 2) {
        const coordinates = element.nodes
          .map((id) => nodes[id])
          .filter(Boolean);

        if (coordinates.length === element.nodes.length) {
          buildings.push({
            footprint: coordinates,
            tags: element.tags || {},
          });
        }
      }
    }

    window.log(`Processed ${buildings.length} buildings from OSM data`);
    return buildings;
  }

  /**
   * Initialize buildings cache for the area
   */
  async initializeBuildingsCache() {
    try {
      const center = window.CONFIG.LOCATION.CENTER;
      const delta = window.CONFIG.LOCATION.BUILDING_FETCH_DELTA;

      const bbox = [
        center.lng - delta,
        center.lat - delta,
        center.lng + delta,
        center.lat + delta,
      ];

      window.log("Fetching buildings in bbox:", bbox);
      this.buildingsCache = await this.fetchBuildings(bbox);
      window.log(`Cached ${this.buildingsCache.length} buildings`);

      return this.buildingsCache;
    } catch (error) {
      console.error("Error initializing buildings cache:", error);
      this.buildingsCache = [];
      return [];
    }
  }

  /**
   * Render shadows for a specific time
   */
  async renderShadowsForTime(timeStr) {
    if (!this.buildingsCache) {
      await this.initializeBuildingsCache();
    }

    try {
      const center = window.CONFIG.LOCATION.CENTER;
      const date = window.TimeUtils.createDateFromTime(timeStr);
      const sunPosition = window.TimeUtils.getSunPosition(
        center.lat,
        center.lng,
        date,
      );

      window.log("Sun position for", timeStr, ":", sunPosition);

      if (sunPosition.altitude <= 0) {
        window.log("Sun is below horizon, no shadows rendered");
        this.lastShadowPolygons = [];
        this.updateMapShadows([]);
        return;
      }

      // Calculate shadow polygons
      this.lastShadowPolygons = this.getBuildingShadows(
        this.buildingsCache,
        sunPosition,
      );

      // Convert to GeoJSON features for map rendering
      const shadowFeatures = this.lastShadowPolygons.map((polygon) => ({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: polygon.geometry.coordinates,
        },
        properties: {},
      }));

      this.updateMapShadows(shadowFeatures);
      window.log(`Rendered ${shadowFeatures.length} shadow polygons`);
    } catch (error) {
      console.error("Error rendering shadows:", error);
    }
  }

  /**
   * Update shadow polygons on the map
   */
  updateMapShadows(shadowFeatures) {
    try {
      const shadowData = {
        type: "FeatureCollection",
        features: shadowFeatures,
      };

      this.mapManager.addOrUpdateSource("shadows", shadowData);

      this.mapManager.addLayerIfNotExists({
        id: "shadows",
        type: "fill",
        source: "shadows",
        paint: {
          "fill-color": "yellow",
          "fill-opacity": 0, // Invisible but present for calculations
        },
      });
    } catch (error) {
      console.error("Error updating map shadows:", error);
    }
  }

  /**
   * Calculate shade rating for a route
   */
  calculateShadeRating(coordinates) {
    if (!coordinates || coordinates.length === 0) {
      return 0;
    }

    let shadedPoints = 0;
    let totalPoints = 0;

    for (const coord of coordinates) {
      totalPoints++;
      if (this.isPointShaded(coord)) {
        shadedPoints++;
      }
    }

    return totalPoints > 0 ? shadedPoints / totalPoints : 0;
  }

  /**
   * Get buildings cache
   */
  getBuildingsCache() {
    return this.buildingsCache;
  }

  /**
   * Get last shadow polygons
   */
  getLastShadowPolygons() {
    return this.lastShadowPolygons;
  }
};
