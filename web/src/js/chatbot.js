/**
 * Heat Safety AI Chatbot with Gemini API
 */

window.HeatSafeChatbot = class {
  constructor() {
    this.isOpen = false;
    this.isLoading = false;
    this.apiKey = window.CONFIG.GEMINI.API_KEY;
    this.apiUrl =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
    this.conversations = [];
    this.initialize();
  }

  initialize() {
    this.setupEventListeners();
    window.log("HeatSafe Chatbot initialized");
  }

  setupEventListeners() {
    const fab = document.getElementById("heat-ai-fab");
    const closeBtn = document.getElementById("heat-ai-close");
    const sendBtn = document.getElementById("heat-ai-send");
    const input = document.getElementById("heat-ai-input");

    if (fab) {
      fab.addEventListener("click", () => this.toggleChat());
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeChat());
    }

    if (sendBtn) {
      sendBtn.addEventListener("click", () => this.sendMessage());
    }

    if (input) {
      input.addEventListener("keypress", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    // Quick action buttons
    const actionButtons = document.querySelectorAll(".action-btn");
    actionButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const action = e.target.getAttribute("data-action");
        this.handleQuickAction(action);
      });
    });
  }

  toggleChat() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }

  openChat() {
    const chat = document.getElementById("heat-ai-chat");
    const fab = document.getElementById("heat-ai-fab");

    if (chat && fab) {
      chat.classList.add("show");
      fab.style.display = "none";
      this.isOpen = true;

      setTimeout(() => {
        const input = document.getElementById("heat-ai-input");
        if (input) input.focus();
      }, 300);
    }
  }

  closeChat() {
    const chat = document.getElementById("heat-ai-chat");
    const fab = document.getElementById("heat-ai-fab");

    if (chat && fab) {
      chat.classList.remove("show");
      fab.style.display = "flex";
      this.isOpen = false;
    }
  }

  async sendMessage() {
    const input = document.getElementById("heat-ai-input");
    if (!input) return;

    const message = input.value.trim();
    if (!message || this.isLoading) return;

    // Add user message
    this.addMessage(message, "user");
    input.value = "";

    // Show typing indicator
    this.showTypingIndicator();
    this.isLoading = true;
    this.updateSendButton();

    try {
      // Fetch current temperature from OpenWeather API
      const temperature = await this.fetchCurrentTemperature();
      const response = await this.callGeminiAPI(message, temperature);
      this.hideTypingIndicator();
      this.addMessage(response, "ai");
    } catch (error) {
      console.error("Gemini API Error:", error);
      this.hideTypingIndicator();
      this.addMessage(
        "Sorry, I'm having trouble right now. Here's a quick tip: In hot weather, drink water every 15-20 minutes, stay in shade, and avoid outdoor activities between 11 AM - 4 PM.",
        "ai",
      );
    } finally {
      this.isLoading = false;
      this.updateSendButton();
    }
  }

  async fetchCurrentTemperature() {
    try {
      const lat = window.startCoordinates ? window.startCoordinates[1] : window.CONFIG.LOCATION.CENTER.lat;
      const lon = window.startCoordinates ? window.startCoordinates[0] : window.CONFIG.LOCATION.CENTER.lng;
      const apiKey = window.CONFIG.OPENWEATHER.API_KEY;
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch weather");
      const data = await response.json();
      if (data && data.main && typeof data.main.temp === "number") {
        return Math.round(data.main.temp);
      }
      throw new Error("Invalid weather data");
    } catch (e) {
      window.log("Weather fetch error: " + e.message);
      return 21; // fallback temperature
    }
  }

  async callGeminiAPI(message, temperature) {
    const prompt = `You are HeatSafe AI, a helpful assistant for outdoor safety and comfort. The current temperature is ${temperature}°C.\n\nUser question: ${message}\n\nIf the user's question is about heat, weather, hydration, or health, provide a concise, practical response (under 100 words) and mention temperature or safety tips only if relevant. For other questions, answer naturally and do not repeat generic safety advice. If someone feels unwell, recommend seeking medical attention immediately.`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 150,
      },
    };

    const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("Invalid response format");
    }
  }

  addMessage(message, sender) {
    const messagesContainer = document.getElementById("heat-ai-messages");
    if (!messagesContainer) return;

    const messageDiv = document.createElement("div");
    messageDiv.className = `heat-ai-message ${sender}-message`;

    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";
    contentDiv.textContent = message;

    messageDiv.appendChild(contentDiv);

    // Remove existing action buttons when user sends message
    if (sender === "user") {
      const existingActions =
        messagesContainer.querySelector(".heat-ai-actions");
      if (existingActions) {
        existingActions.remove();
      }
    }

    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  showTypingIndicator() {
    const messagesContainer = document.getElementById("heat-ai-messages");
    if (!messagesContainer) return;

    const typingDiv = document.createElement("div");
    typingDiv.className = "typing-indicator";
    typingDiv.id = "typing-indicator";

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement("div");
      dot.className = "typing-dot";
      typingDiv.appendChild(dot);
    }

    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  hideTypingIndicator() {
    const typingIndicator = document.getElementById("typing-indicator");
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  updateSendButton() {
    const sendBtn = document.getElementById("heat-ai-send");
    if (sendBtn) {
      sendBtn.disabled = this.isLoading;
    }
  }

  handleQuickAction(action) {
    const actionMessages = {
      outfit: "What should I wear in 21°C heat to stay cool?",
      cooling: "Where can I find cooling centers nearby?",
      route: "How do I plan a safe route in extreme heat?",
      emergency: "I feel dizzy and nauseous from the heat. Help!",
    };

    const message = actionMessages[action];
    if (message) {
      const input = document.getElementById("heat-ai-input");
      if (input) {
        input.value = message;
        this.sendMessage();
      }
    }
  }

  // Integration with main app
  integrateWithApp(mapManager, routingSystem) {
    this.mapManager = mapManager;
    this.routingSystem = routingSystem;
    window.log("Chatbot integrated with main app");
  }
};
