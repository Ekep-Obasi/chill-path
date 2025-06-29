/**
 * Geolocation Manager - Handles user location detection and reverse geocoding
 */

import { CONFIG } from "./config.js";
import { ValidationUtils, log } from "./utils.js";

export class GeolocationManager {
  constructor() {
    this.userLocation = null;
    this.watchId = null;
  }

  /**
   * Get user's current location
   */
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = new Error("Geolocation is not supported by this browser");
        console.warn(error.message);
        reject(error);
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coordinates = [
            position.coords.longitude,
            position.coords.latitude,
          ];

          if (ValidationUtils.isValidCoordinates(coordinates)) {
            this.userLocation = {
              lng: coordinates[0],
              lat: coordinates[1],
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
            };

            log("User location obtained:", this.userLocation);
            resolve(this.userLocation);
          } else {
            reject(new Error("Invalid coordinates received"));
          }
        },
        (error) => {
          log("Geolocation error:", this.getLocationErrorMessage(error));
          reject(error);
        },
        options,
      );
    });
  }

  /**
   * Watch user's location for changes
   */
  watchLocation(callback) {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser");
      return null;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // 1 minute
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coordinates = [
          position.coords.longitude,
          position.coords.latitude,
        ];

        if (ValidationUtils.isValidCoordinates(coordinates)) {
          this.userLocation = {
            lng: coordinates[0],
            lat: coordinates[1],
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };

          if (typeof callback === "function") {
            callback(this.userLocation);
          }
        }
      },
      (error) => {
        log("Geolocation watch error:", this.getLocationErrorMessage(error));
      },
      options,
    );

    return this.watchId;
  }

  /**
   * Stop watching location
   */
  stopWatching() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      log("Stopped watching user location");
    }
  }

  /**
   * Reverse geocode coordinates to get readable address
   */
  async reverseGeocode(coordinates) {
    try {
      if (!ValidationUtils.isValidCoordinates(coordinates)) {
        throw new Error("Invalid coordinates for reverse geocoding");
      }

      const [lng, lat] = coordinates;
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${CONFIG.MAPBOX.API_KEY}&types=address`;

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
        placeName: `Current Location (${lng.toFixed(6)}, ${lat.toFixed(6)})`,
        address: "Location name unavailable",
        coordinates: coordinates,
      };
    }
  }

  /**
   * Initialize user location and set as start location
   */
  async initializeUserLocation(autocompleteInstance) {
    try {
      const location = await this.getCurrentLocation();
      const geocodedLocation = await this.reverseGeocode([
        location.lng,
        location.lat,
      ]);

      // Set location in the start autocomplete field
      if (autocompleteInstance) {
        autocompleteInstance.setLocation(
          [location.lng, location.lat],
          geocodedLocation.placeName,
        );
      }

      log("User location set as start location");
      return location;
    } catch (error) {
      console.warn("Could not initialize user location:", error);
      return null;
    }
  }

  /**
   * Get human-readable error message
   */
  getLocationErrorMessage(error) {
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
  isLocationAvailable() {
    return "geolocation" in navigator;
  }

  /**
   * Get cached user location
   */
  getUserLocation() {
    return this.userLocation;
  }

  /**
   * Calculate distance from user location to coordinates
   */
  getDistanceFromUser(coordinates) {
    if (
      !this.userLocation ||
      !ValidationUtils.isValidCoordinates(coordinates)
    ) {
      return null;
    }

    const userCoords = [this.userLocation.lng, this.userLocation.lat];
    return this.calculateDistance(userCoords, coordinates);
  }

  /**
   * Calculate distance between two coordinate pairs
   */
  calculateDistance(coord1, coord2) {
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
  }
}
