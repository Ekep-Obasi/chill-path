/**
 * UI Controller - Manages user interface interactions and updates
 */

import { CONFIG } from "./config.js";
import { DOMUtils, TimeUtils, ValidationUtils, log } from "./utils.js";

export class UIController {
  constructor(appInstance) {
    this.app = appInstance;
    this.startCoordinates = null;
    this.endCoordinates = null;
    this.timeUpdateInterval = null;
  }

  /**
   * Initialize UI controller and set up event listeners
   */
  initialize() {
    this.setupEventListeners();
    this.initializeTimeControls();
    this.updateButtonStates();
    log("UI Controller initialized");
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Sun position controls
    this.setupSunPositionControls();

    // Route controls
    this.setupRouteControls();

    // Advanced options
    this.setupAdvancedControls();
  }

  /**
   * Set up sun position control event listeners
   */
  setupSunPositionControls() {
    const updateShadowsBtn = DOMUtils.getElementById("update-shadows");
    const sunTimeInput = DOMUtils.getElementById("sun-time");

    DOMUtils.addEventListener(updateShadowsBtn, "click", async () => {
      await this.handleUpdateShadows();
    });

    DOMUtils.addEventListener(sunTimeInput, "change", async () => {
      await this.handleTimeChange();
    });
  }

  /**
   * Set up route control event listeners
   */
  setupRouteControls() {
    const getRouteBtn = DOMUtils.getElementById("get-route");
    const findShadyPathBtn = DOMUtils.getElementById("find-shadiest-path");

    DOMUtils.addEventListener(getRouteBtn, "click", async () => {
      await this.handleGetRoute();
    });

    DOMUtils.addEventListener(findShadyPathBtn, "click", async () => {
      await this.handleFindShadyPath();
    });
  }

  /**
   * Set up advanced control event listeners
   */
  setupAdvancedControls() {
    const showHighwaysBtn = DOMUtils.getElementById("show-highways");

    DOMUtils.addEventListener(showHighwaysBtn, "click", async () => {
      await this.handleShowHighways();
    });
  }

  /**
   * Initialize time controls
   */
  initializeTimeControls() {
    const sunTimeInput = DOMUtils.getElementById("sun-time");
    if (sunTimeInput) {
      sunTimeInput.value = TimeUtils.getCurrentTime();
    }

    // Start automatic time updates
    this.startTimeUpdates();
  }

  /**
   * Start automatic time updates
   */
  startTimeUpdates() {
    this.timeUpdateInterval = setInterval(() => {
      const sunTimeInput = DOMUtils.getElementById("sun-time");
      const currentTime = TimeUtils.getCurrentTime();

      if (sunTimeInput && sunTimeInput.value !== currentTime) {
        sunTimeInput.value = currentTime;
        this.handleTimeChange();
      }
    }, CONFIG.UI.TIME_UPDATE_INTERVAL);
  }

  /**
   * Stop automatic time updates
   */
  stopTimeUpdates() {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval);
      this.timeUpdateInterval = null;
    }
  }

  /**
   * Handle coordinate selection from autocomplete
   */
  onCoordinateSelection(coordinates, label) {
    if (label === "start location") {
      this.startCoordinates = coordinates;
    } else if (label === "destination") {
      this.endCoordinates = coordinates;
    }

    this.validateLocationPair();
    this.updateButtonStates();

    log(`Coordinates selected for ${label}:`, coordinates);
  }

  /**
   * Validate location pair for conflicts
   */
  validateLocationPair() {
    if (this.startCoordinates && this.endCoordinates) {
      const distance = this.calculateDistance(
        this.startCoordinates,
        this.endCoordinates,
      );

      if (distance < CONFIG.AUTOCOMPLETE.SAME_LOCATION_THRESHOLD) {
        this.showError("Start and destination cannot be the same location.");
        this.endCoordinates = null;
        return false;
      }
    }
    return true;
  }

  /**
   * Calculate distance between coordinates
   */
  calculateDistance(coord1, coord2) {
    const dx = coord1[0] - coord2[0];
    const dy = coord1[1] - coord2[1];
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Update button enabled/disabled states
   */
  updateButtonStates() {
    const getRouteBtn = DOMUtils.getElementById("get-route");
    const findShadyPathBtn = DOMUtils.getElementById("find-shadiest-path");

    const hasValidLocations = this.startCoordinates && this.endCoordinates;

    if (getRouteBtn) {
      getRouteBtn.disabled = !hasValidLocations;
    }

    if (findShadyPathBtn) {
      findShadyPathBtn.disabled = !hasValidLocations;
    }
  }

  /**
   * Handle update shadows button click
   */
  async handleUpdateShadows() {
    try {
      const sunTimeInput = DOMUtils.getElementById("sun-time");
      const timeStr = sunTimeInput.value;

      if (!ValidationUtils.isValidTime(timeStr)) {
        this.showError("Please enter a valid time.");
        return;
      }

      this.setLoading(true, "Updating shadows...");

      await this.app.shadeSystem.renderShadowsForTime(timeStr);
      this.app.mapManager.updateShadeMapTime(timeStr);

      this.showSuccess("Sun position updated successfully.");
    } catch (error) {
      this.showError("Failed to update sun position.");
      console.error("Error updating shadows:", error);
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Handle time input change
   */
  async handleTimeChange() {
    const sunTimeInput = DOMUtils.getElementById("sun-time");
    const timeStr = sunTimeInput.value;

    if (
      ValidationUtils.isValidTime(timeStr) &&
      this.app.mapManager.isMapLoaded()
    ) {
      try {
        await this.app.shadeSystem.renderShadowsForTime(timeStr);
        this.app.mapManager.updateShadeMapTime(timeStr);
      } catch (error) {
        console.error("Error updating time:", error);
      }
    }
  }

  /**
   * Handle get route button click
   */
  async handleGetRoute() {
    if (!this.validateRouteInputs()) return;

    try {
      this.setLoading(true, "Calculating route...");

      const result = await this.app.routingSystem.renderStandardRoute(
        this.startCoordinates,
        this.endCoordinates,
      );

      this.showSuccess(result.message);
    } catch (error) {
      this.showError("Failed to calculate route. Please try again.");
      console.error("Error getting route:", error);
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Handle find shady path button click
   */
  async handleFindShadyPath() {
    if (!this.validateRouteInputs()) return;

    try {
      this.setLoading(true, "Finding shadiest path...");

      const result = await this.app.routingSystem.findShadiestPath(
        this.startCoordinates,
        this.endCoordinates,
      );

      this.showSuccess(result.message);
    } catch (error) {
      this.showError("Failed to find shady path. Please try again.");
      console.error("Error finding shady path:", error);
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Handle show highways button click
   */
  async handleShowHighways() {
    try {
      this.setLoading(true, "Loading road network...");

      await this.app.routingSystem.renderHighwayNetwork();
      this.showSuccess("Road network displayed.");
    } catch (error) {
      this.showError("Failed to load road network.");
      console.error("Error showing highways:", error);
    } finally {
      this.setLoading(false);
    }
  }

  /**
   * Validate route inputs
   */
  validateRouteInputs() {
    if (!this.startCoordinates || !this.endCoordinates) {
      this.showError(
        "Please select both start and destination locations using the search fields.",
      );
      return false;
    }

    if (
      !ValidationUtils.isValidCoordinates(this.startCoordinates) ||
      !ValidationUtils.isValidCoordinates(this.endCoordinates)
    ) {
      this.showError(
        "Invalid coordinates detected. Please reselect locations.",
      );
      return false;
    }

    return true;
  }

  /**
   * Set loading state for the UI
   */
  setLoading(isLoading, message = "") {
    const controlPanel = document.querySelector(".control-panel");

    if (isLoading) {
      controlPanel?.classList.add("loading");
      if (message) {
        this.showInfo(message);
      }
    } else {
      controlPanel?.classList.remove("loading");
    }
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    this.showNotification(message, "success");
  }

  /**
   * Show error message
   */
  showError(message) {
    this.showNotification(message, "error");
  }

  /**
   * Show info message
   */
  showInfo(message) {
    this.showNotification(message, "info");
  }

  /**
   * Show notification (using alert for now, can be enhanced)
   */
  showNotification(message, type = "info") {
    // For now, using alert. In a production app, you'd want a proper notification system
    alert(message);
    log(`Notification (${type}): ${message}`);
  }

  /**
   * Get current coordinates
   */
  getCoordinates() {
    return {
      start: this.startCoordinates,
      end: this.endCoordinates,
    };
  }

  /**
   * Set coordinates programmatically
   */
  setCoordinates(startCoords, endCoords) {
    this.startCoordinates = startCoords;
    this.endCoordinates = endCoords;
    this.updateButtonStates();
  }

  /**
   * Clear all coordinates
   */
  clearCoordinates() {
    this.startCoordinates = null;
    this.endCoordinates = null;
    this.updateButtonStates();
  }

  /**
   * Cleanup UI controller
   */
  destroy() {
    this.stopTimeUpdates();
    log("UI Controller destroyed");
  }
}
