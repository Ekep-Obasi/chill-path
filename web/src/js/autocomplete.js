/**
 * Location Autocomplete Component
 */

window.LocationAutocomplete = class {
  constructor(inputId, suggestionsId, validationId, label) {
    this.input = window.DOMUtils.getElementById(inputId);
    this.suggestionsContainer = window.DOMUtils.getElementById(suggestionsId);
    this.validationMessage = window.DOMUtils.getElementById(validationId);

    this.selectedCoordinates = null;
    this.currentFocus = -1;
    this.suggestions = [];
    this.label = label;

    // Create debounced search function
    this.debouncedSearch = window.debounce(
      this.searchLocations.bind(this),
      window.CONFIG.AUTOCOMPLETE.DEBOUNCE_DELAY,
    );

    this.initialize();
  }

  /**
   * Initialize autocomplete functionality
   */
  initialize() {
    if (!this.input || !this.suggestionsContainer) {
      console.error("Autocomplete: Required elements not found");
      return;
    }

    this.setupEventListeners();
    window.log(`Autocomplete initialized for ${this.label}`);
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Input events
    window.DOMUtils.addEventListener(this.input, "input", (e) => {
      this.handleInput(e.target.value.trim());
    });

    // Keyboard navigation
    window.DOMUtils.addEventListener(this.input, "keydown", (e) => {
      this.handleKeydown(e);
    });

    // Focus events
    window.DOMUtils.addEventListener(this.input, "focus", () => {
      if (
        this.suggestions.length > 0 &&
        this.input.value.length >= window.CONFIG.AUTOCOMPLETE.MIN_QUERY_LENGTH
      ) {
        this.showSuggestions();
      }
    });

    // Prevent blur on mousedown to handle clicks properly
    window.DOMUtils.addEventListener(
      this.suggestionsContainer,
      "mousedown",
      (e) => {
        e.preventDefault();
      },
    );

    // Handle suggestion clicks
    window.DOMUtils.addEventListener(
      this.suggestionsContainer,
      "click",
      (e) => {
        const suggestion = e.target.closest(".autocomplete-suggestion");
        if (suggestion) {
          const index = Array.from(this.suggestionsContainer.children).indexOf(
            suggestion,
          );
          this.selectSuggestion(index);
        }
      },
    );

    // Close on outside click
    window.DOMUtils.addEventListener(document, "click", (e) => {
      if (
        !this.input.contains(e.target) &&
        !this.suggestionsContainer.contains(e.target)
      ) {
        this.hideSuggestions();
      }
    });
  }

  /**
   * Handle input changes
   */
  handleInput(query) {
    this.clearSelection();
    this.hideValidationMessage();

    if (query.length < window.CONFIG.AUTOCOMPLETE.MIN_QUERY_LENGTH) {
      this.hideSuggestions();
      return;
    }

    this.debouncedSearch(query);
  }

  /**
   * Handle keyboard navigation
   */
  handleKeydown(e) {
    if (!this.isSuggestionsVisible()) {
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.currentFocus = Math.min(
          this.currentFocus + 1,
          this.suggestions.length - 1,
        );
        this.updateFocus();
        break;
      case "ArrowUp":
        e.preventDefault();
        this.currentFocus = Math.max(this.currentFocus - 1, -1);
        this.updateFocus();
        break;
      case "Enter":
        e.preventDefault();
        if (this.currentFocus >= 0) {
          this.selectSuggestion(this.currentFocus);
        }
        break;
      case "Escape":
        this.hideSuggestions();
        this.input.blur();
        break;
    }
  }

  /**
   * Update focus highlighting
   */
  updateFocus() {
    const suggestions = this.suggestionsContainer.children;

    // Remove previous highlights
    Array.from(suggestions).forEach((suggestion) => {
      suggestion.classList.remove("highlighted");
      suggestion.setAttribute("aria-selected", "false");
    });

    // Highlight current
    if (this.currentFocus >= 0 && this.currentFocus < suggestions.length) {
      const currentSuggestion = suggestions[this.currentFocus];
      currentSuggestion.classList.add("highlighted");
      currentSuggestion.setAttribute("aria-selected", "true");
      currentSuggestion.scrollIntoView({ block: "nearest" });
    }
  }

  /**
   * Search for locations using Mapbox Geocoding API
   */
  async searchLocations(query) {
    try {
      const url = window.APIUtils.buildURL(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
        {
          access_token: window.CONFIG.MAPBOX.API_KEY,
          proximity: window.CONFIG.LOCATION.SEARCH_PROXIMITY,
          bbox: window.CONFIG.LOCATION.SEARCH_BBOX,
          limit: window.CONFIG.AUTOCOMPLETE.MAX_SUGGESTIONS,
          types: "address,poi,place",
        },
      );

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();
      this.displaySuggestions(data.features);
    } catch (error) {
      console.error("Geocoding error:", error);
      this.hideSuggestions();
    }
  }

  /**
   * Display search suggestions
   */
  displaySuggestions(features) {
    this.suggestions = features;
    this.suggestionsContainer.innerHTML = "";
    this.currentFocus = -1;

    if (features.length === 0) {
      this.hideSuggestions();
      return;
    }

    features.forEach((feature) => {
      const suggestion = this.createSuggestionElement(feature);
      this.suggestionsContainer.appendChild(suggestion);
    });

    this.showSuggestions();
  }

  /**
   * Create suggestion DOM element
   */
  createSuggestionElement(feature) {
    const suggestion = document.createElement("div");
    suggestion.className = "autocomplete-suggestion";
    suggestion.setAttribute("role", "option");
    suggestion.setAttribute("aria-selected", "false");

    const name = document.createElement("div");
    name.className = "suggestion-name";
    name.textContent = feature.text || feature.place_name;

    const address = document.createElement("div");
    address.className = "suggestion-address";
    address.textContent = feature.place_name;

    suggestion.appendChild(name);
    suggestion.appendChild(address);

    return suggestion;
  }

  /**
   * Select a suggestion
   */
  selectSuggestion(index) {
    if (index < 0 || index >= this.suggestions.length) return;

    const feature = this.suggestions[index];
    this.selectLocation(feature);
  }

  /**
   * Select a location
   */
  selectLocation(feature) {
    this.input.value = feature.place_name;
    this.selectedCoordinates = feature.geometry.coordinates;
    this.hideSuggestions();

    // Update visual state
    this.input.classList.add("location-selected");
    this.input.classList.remove("error-state");
    this.hideValidationMessage();

    // Update global coordinates
    if (this.input.id === "route-start-search") {
      window.startCoordinates = this.selectedCoordinates;
    } else if (this.input.id === "route-end-search") {
      window.endCoordinates = this.selectedCoordinates;
    }

    // Validate and update UI
    this.validateLocations();
    window.updateButtonStates();

    window.log(
      `Selected ${this.label}: ${feature.place_name} at [${this.selectedCoordinates[0]}, ${this.selectedCoordinates[1]}]`,
    );
  }

  /**
   * Clear current selection
   */
  clearSelection() {
    this.selectedCoordinates = null;
    this.input.classList.remove("location-selected", "error-state");

    // Clear global coordinates
    if (this.input.id === "route-start-search") {
      window.startCoordinates = null;
    } else if (this.input.id === "route-end-search") {
      window.endCoordinates = null;
    }

    window.updateButtonStates();
  }

  /**
   * Validate selected location
   */
  validateLocations() {
    if (window.startCoordinates && window.endCoordinates) {
      if (
        window.GeoUtils.areCoordinatesEqual(
          window.startCoordinates,
          window.endCoordinates,
        )
      ) {
        this.showValidationMessage(
          "Start and destination cannot be the same location.",
        );
        this.input.classList.add("error-state");
        this.input.classList.remove("location-selected");
        this.clearSelection();
        return false;
      }
    }
    return true;
  }

  /**
   * Show validation message
   */
  showValidationMessage(message) {
    if (this.validationMessage) {
      this.validationMessage.textContent = message;
      this.validationMessage.classList.add("show");
    }
  }

  /**
   * Hide validation message
   */
  hideValidationMessage() {
    if (this.validationMessage) {
      this.validationMessage.classList.remove("show");
    }
  }

  /**
   * Show suggestions dropdown
   */
  showSuggestions() {
    window.DOMUtils.toggleVisibility(this.suggestionsContainer, true);
    this.input.setAttribute("aria-expanded", "true");
  }

  /**
   * Hide suggestions dropdown
   */
  hideSuggestions() {
    window.DOMUtils.toggleVisibility(this.suggestionsContainer, false);
    this.input.setAttribute("aria-expanded", "false");
    this.currentFocus = -1;
  }

  /**
   * Check if suggestions are visible
   */
  isSuggestionsVisible() {
    return (
      this.suggestionsContainer.style.display !== "none" &&
      this.suggestionsContainer.style.display !== ""
    );
  }

  /**
   * Get selected coordinates
   */
  getCoordinates() {
    return this.selectedCoordinates;
  }

  /**
   * Set location programmatically
   */
  setLocation(coordinates, placeName) {
    this.selectedCoordinates = coordinates;
    this.input.value = placeName;
    this.hideSuggestions();
    this.clearValidation();

    // Trigger the callback if it exists
    if (this.onLocationSelected) {
      this.onLocationSelected(coordinates, placeName);
    }
  }

  /**
   * Clear input and selection
   */
  clear() {
    this.input.value = "";
    this.clearSelection();
    this.hideValidationMessage();
    this.hideSuggestions();
  }
};
