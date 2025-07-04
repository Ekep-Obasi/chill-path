/**
 * Weather Manager - Handles weather data integration and display
 */

window.WeatherManager = class {
    constructor() {
      this.apiKey = window.CONFIG.WEATHER?.API_KEY || null;
      this.currentWeather = null;
      this.updateInterval = null;
      this.lastUpdated = null;
    }
  
    /**
     * Initialize weather manager
     */
    async initialize() {
      try {
        // Set up UI elements
        this.setupWeatherUI();
        
        // Try to get weather data
        if (this.apiKey) {
            console.log("Weather API key found, fetching data...");
          await this.updateWeatherData();
          this.startAutoUpdate();
        } else {
            console.log("Weather not API key found, fetching data...");

          // Use mock data if no API key
          this.displayMockWeather();
        }
  
        window.log("Weather Manager initialized");
      } catch (error) {
        console.error("Error initializing Weather Manager:", error);
        this.displayMockWeather();
      }
    }
  
    /**
     * Set up weather UI elements
     */
    setupWeatherUI() {
      // Update time display immediately and then every minute
      this.updateTimeDisplay();
      setInterval(() => this.updateTimeDisplay(), 60000);
    }
  
    /**
     * Update current time display
     */
    updateTimeDisplay() {
      const timeElement = document.getElementById('current-time');
      if (timeElement) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true 
        });
        timeElement.textContent = timeString;
      }
    }
  
    /**
     * Fetch weather data from API
     */
    async fetchWeatherData(lat = 43.6577, lon = -79.3788) {
      if (!this.apiKey) {
        throw new Error("No weather API key configured");
      }
  
      try {
        // Using OpenWeatherMap API as example
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric`;
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Weather API error: ${response.status}`);
        }
  
        const data = await response.json();
        return this.processWeatherData(data);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        throw error;
      }
    }
  
    /**
     * Process raw weather data
     */
    processWeatherData(data) {
      return {
        temperature: Math.round(data.main.temp),
        feelsLike: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        visibility: Math.round(data.visibility / 1000), // Convert m to km
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        location: data.name,
        rain: data.rain?.['1h'] || 0,
        timestamp: Date.now()
      };
    }
  
    /**
     * Update weather data and display
     */
    async updateWeatherData() {
      try {
        let weatherData;
        
        if (this.apiKey) {
          // Use user location if available
          const userLocation = window.getUserLocation?.();
          if (userLocation) {
            weatherData = await this.fetchWeatherData(userLocation.lat, userLocation.lng);
          } else {
            // Default to Toronto coordinates
            weatherData = await this.fetchWeatherData();
          }
        } else {
          // Use mock data
          weatherData = this.getMockWeatherData();
        }
  
        this.currentWeather = weatherData;
        this.lastUpdated = Date.now();
        this.displayWeatherData(weatherData);
  
        window.log("Weather data updated:", weatherData);
      } catch (error) {
        console.error("Error updating weather data:", error);
        this.displayMockWeather();
      }
    }
  
    /**
     * Get mock weather data for demonstration
     */
    getMockWeatherData() {
      return {
        temperature: 38,
        feelsLike: 42,
        humidity: 65,
        windSpeed: 12,
        visibility: 10,
        description: "Sunny and very hot",
        icon: "01d",
        location: "Toronto, ON",
        rain: 0,
        timestamp: Date.now()
      };
    }
  
    /**
     * Display weather data in UI
     */
    displayWeatherData(weather) {
      // Update temperature
      const tempElement = document.getElementById('weather-temp');
      if (tempElement) {
        tempElement.textContent = `${weather.temperature}°C`;
        
        // Color code temperature
        if (weather.temperature >= 35) {
          tempElement.style.color = '#ea4335'; // Red for extreme heat
        } else if (weather.temperature >= 30) {
          tempElement.style.color = '#fbbc04'; // Yellow for hot
        } else {
          tempElement.style.color = '#34a853'; // Green for normal
        }
      }
  
      // Update description
      const descElement = document.getElementById('weather-desc');
      if (descElement) {
        descElement.textContent = this.capitalizeFirst(weather.description);
      }
  
      // Update weather icon
      const iconElement = document.getElementById('weather-icon');
      if (iconElement) {
        iconElement.textContent = this.getWeatherEmoji(weather.icon, weather.temperature);
      }
  
      // Update location
      const locationElement = document.getElementById('weather-location');
      if (locationElement) {
        locationElement.textContent = weather.location;
      }
  
      // Update details
      this.updateWeatherDetail('weather-humidity', `Humidity: ${weather.humidity}%`);
      this.updateWeatherDetail('weather-wind', `Wind: ${weather.windSpeed} km/h`);
      this.updateWeatherDetail('weather-visibility', `Visibility: ${weather.visibility} km`);
      this.updateWeatherDetail('weather-rain', `Rain: ${weather.rain}%`);
  
      // Update heat warning
      this.updateHeatWarning(weather.temperature, weather.feelsLike);
    }
  
    /**
     * Update weather detail element
     */
    updateWeatherDetail(elementId, text) {
      const element = document.getElementById(elementId);
      if (element) {
        element.textContent = text;
      }
    }
  
    /**
     * Update heat warning display
     */
    updateHeatWarning(temp, feelsLike) {
      const warningElement = document.getElementById('heat-warning');
      const warningTextElement = document.getElementById('heat-warning-text');
      
      if (!warningElement || !warningTextElement) return;
  
      let warningMessage = '';
      let shouldShow = false;
  
      if (temp >= 40 || feelsLike >= 45) {
        warningMessage = 'Extreme heat warning! Avoid outdoor activities. Stay indoors with AC.';
        shouldShow = true;
        warningElement.style.background = '#fce8e6';
        warningElement.style.borderColor = '#ea4335';
        warningElement.style.color = '#d93025';
      } else if (temp >= 35 || feelsLike >= 40) {
        warningMessage = 'Heat warning in effect. Stay hydrated and seek shade frequently.';
        shouldShow = true;
        warningElement.style.background = '#fef7e0';
        warningElement.style.borderColor = '#fbbc04';
        warningElement.style.color = '#b8860b';
      } else if (temp >= 30 || feelsLike >= 35) {
        warningMessage = 'Hot weather advisory. Drink plenty of water and limit sun exposure.';
        shouldShow = true;
        warningElement.style.background = '#e8f5e8';
        warningElement.style.borderColor = '#34a853';
        warningElement.style.color = '#1e8e3e';
      }
  
      if (shouldShow) {
        warningTextElement.textContent = warningMessage;
        warningElement.style.display = 'flex';
      } else {
        warningElement.style.display = 'none';
      }
    }
  
    /**
     * Get appropriate emoji for weather condition
     */
    getWeatherEmoji(icon, temperature) {
      // OpenWeatherMap icon mapping
      const iconMap = {
        '01d': temperature >= 35 ? '🌡️' : '☀️', // Clear sky day
        '01n': '🌙', // Clear sky night
        '02d': '⛅', // Few clouds day
        '02n': '☁️', // Few clouds night
        '03d': '☁️', // Scattered clouds
        '03n': '☁️',
        '04d': '☁️', // Broken clouds
        '04n': '☁️',
        '09d': '🌦️', // Shower rain
        '09n': '🌧️',
        '10d': '🌦️', // Rain day
        '10n': '🌧️', // Rain night
        '11d': '⛈️', // Thunderstorm
        '11n': '⛈️',
        '13d': '❄️', // Snow
        '13n': '❄️',
        '50d': '🌫️', // Mist
        '50n': '🌫️'
      };
  
      return iconMap[icon] || (temperature >= 35 ? '🌡️' : '🌤️');
    }
  
    /**
     * Capitalize first letter of string
     */
    capitalizeFirst(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  
    /**
     * Display mock weather for demonstration
     */
    displayMockWeather() {
      const mockWeather = this.getMockWeatherData();
      this.currentWeather = mockWeather;
      this.displayWeatherData(mockWeather);
    }
  
    /**
     * Start automatic weather updates
     */
    startAutoUpdate() {
      // Update every 10 minutes
      this.updateInterval = setInterval(() => {
        this.updateWeatherData();
      }, 10 * 60 * 1000);
    }
  
    /**
     * Stop automatic weather updates
     */
    stopAutoUpdate() {
      if (this.updateInterval) {
        clearInterval(this.updateInterval);
        this.updateInterval = null;
      }
    }
  
    /**
     * Get current weather data
     */
    getCurrentWeather() {
      return this.currentWeather;
    }
  
    /**
     * Check if weather data is recent (within 15 minutes)
     */
    isWeatherDataFresh() {
      if (!this.lastUpdated) return false;
      const fifteenMinutes = 15 * 60 * 1000;
      return (Date.now() - this.lastUpdated) < fifteenMinutes;
    }
  
    /**
     * Get heat index calculation
     */
    calculateHeatIndex(temp, humidity) {
      // Simplified heat index calculation
      if (temp < 27) return temp;
      
      const T = temp;
      const RH = humidity;
      
      const HI = -8.78469475556 +
                 1.61139411 * T +
                 2.33854883889 * RH +
                 -0.14611605 * T * RH +
                 -0.012308094 * T * T +
                 -0.0164248277778 * RH * RH +
                 0.002211732 * T * T * RH +
                 0.00072546 * T * RH * RH +
                 -0.000003582 * T * T * RH * RH;
      
      return Math.round(HI);
    }
  
    /**
     * Get UV index warning
     */
    getUVWarning(uvIndex) {
      if (uvIndex >= 11) return { level: 'Extreme', color: '#6b46c1', message: 'Avoid sun exposure' };
      if (uvIndex >= 8) return { level: 'Very High', color: '#dc2626', message: 'Extra protection needed' };
      if (uvIndex >= 6) return { level: 'High', color: '#ea580c', message: 'Protection required' };
      if (uvIndex >= 3) return { level: 'Moderate', color: '#ca8a04', message: 'Some protection needed' };
      return { level: 'Low', color: '#16a34a', message: 'Minimal protection needed' };
    }
  
    /**
     * Cleanup weather manager
     */
    destroy() {
      this.stopAutoUpdate();
      window.log("Weather Manager destroyed");
    }
  };