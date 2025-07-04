/**
 * Professional Marker System
 * Add this to your existing working code
 */

// Global marker variables
let userLocationMarker = null;

/**
 * Create custom marker element with emoji
 */
function createCustomMarker(
  emoji,
  size = 36,
  backgroundColor = "#ffffff",
  borderColor = "#333333"
) {
  const el = document.createElement("div");
  el.innerHTML = emoji;
  el.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    background-color: ${backgroundColor};
    border: 2px solid ${borderColor};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${size * 0.6}px;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    transition: transform 0.2s ease;
  `;

  // Add hover effect
  el.addEventListener("mouseenter", () => {
    el.style.transform = "scale(1.1)";
  });

  el.addEventListener("mouseleave", () => {
    el.style.transform = "scale(1)";
  });

  return el;
}

/**
 * Create user location marker (red with animation)
 */
function createUserLocationMarker() {
  const el = document.createElement("div");
  el.innerHTML = "📍";
  el.style.cssText = `
    width: 40px;
    height: 40px;
    background-color: #dc3545;
    border: 3px solid #ffffff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
    animation: userPulse 2s infinite;
  `;

  // Add CSS animation if not already added
  if (!document.getElementById("user-marker-styles")) {
    const style = document.createElement("style");
    style.id = "user-marker-styles";
    style.textContent = `
      @keyframes userPulse {
        0% {
          transform: scale(1);
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
        }
        50% {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(220, 53, 69, 0.6);
        }
        100% {
          transform: scale(1);
          box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
        }
      }
    `;
    document.head.appendChild(style);
  }

  return el;
}

/**
 * Add user location marker to map
 */
function addUserLocationMarker(coordinates) {
  // Remove existing user marker
  if (userLocationMarker) {
    userLocationMarker.remove();
  }

  const markerElement = createUserLocationMarker();

  userLocationMarker = new mapboxgl.Marker({
    element: markerElement,
    anchor: "center",
  })
    .setLngLat(coordinates)
    .setPopup(
      new mapboxgl.Popup({ offset: 25 }).setHTML(
        '<div style="text-align: center; padding: 8px;"><strong>📍 Your Location</strong><br><small>Current position</small></div>'
      )
    )
    .addTo(map);

  console.log("User location marker added at:", coordinates);
  return userLocationMarker;
}

/**
 * Replace your existing fountain fetching function with this:
 */
async function fetchAndLogFountains() {
  clearMarkers(fountainMarkers);
  try {
    const res = await fetch("https://chill-path-mo36.onrender.com/fountains");
    if (!res.ok) throw new Error("Fountains API error");
    const data = await res.json();

    const tmuCenter = [-79.3788, 43.6577];
    function haversine(lon1, lat1, lon2, lat2) {
      const R = 6371000;
      const toRad = (x) => (x * Math.PI) / 180;
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

    data.forEach((fountain) => {
      const lon = fountain.longitude || fountain.lon || fountain.lng;
      const lat = fountain.latitude || fountain.lat;
      if (typeof lon !== "number" || typeof lat !== "number") return;
      const dist = haversine(tmuCenter[0], tmuCenter[1], lon, lat);
      if (dist <= 2000) {
        let popupText =
          '<div style="text-align: center; padding: 8px;"><strong>⛲ Water Fountain</strong>';
        if (fountain.type) {
          popupText += `<br><small>Type: ${fountain.type}</small>`;
        }
        popupText += "</div>";

        // Create custom fountain marker
        const markerElement = createCustomMarker(
          "⛲",
          36,
          "#e3f2fd",
          "#2196f3"
        );

        const marker = new mapboxgl.Marker({
          element: markerElement,
          anchor: "center",
        })
          .setLngLat([lon, lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupText))
          .addTo(map);
        fountainMarkers.push(marker);
      }
    });
  } catch (e) {
    console.error("[Fountains API] Failed to fetch:", e);
  }
}

/**
 * Replace your existing bench fetching function with this:
 */
async function fetchAndPlotBenches() {
  clearMarkers(benchMarkers);
  try {
    const res = await fetch("https://chill-path-mo36.onrender.com/benches");
    if (!res.ok) throw new Error("Benches API error");
    const data = await res.json();

    const tmuCenter = [-79.3788, 43.6577];
    function haversine(lon1, lat1, lon2, lat2) {
      const R = 6371000;
      const toRad = (x) => (x * Math.PI) / 180;
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

    data.forEach((bench) => {
      const lon = bench.longitude || bench.lon || bench.lng;
      const lat = bench.latitude || bench.lat;
      if (typeof lon !== "number" || typeof lat !== "number") return;
      const dist = haversine(tmuCenter[0], tmuCenter[1], lon, lat);
      if (dist <= 2000) {
        const popupText =
          '<div style="text-align: center; padding: 8px;"><strong>🪑 Bench</strong><br><small>Place to rest</small></div>';

        // Create custom bench marker
        const markerElement = createCustomMarker(
          "🪑",
          36,
          "#fff3e0",
          "#ff9800"
        );

        const marker = new mapboxgl.Marker({
          element: markerElement,
          anchor: "center",
        })
          .setLngLat([lon, lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupText))
          .addTo(map);
        benchMarkers.push(marker);
      }
    });
  } catch (e) {
    console.error("[Benches API] Failed to fetch:", e);
  }
}

/**
 * Replace your existing washroom fetching function with this:
 */
async function fetchAndPlotWashrooms() {
  clearMarkers(washroomMarkers);
  try {
    const res = await fetch("https://chill-path-mo36.onrender.com/washrooms");
    if (!res.ok) throw new Error("Washrooms API error");
    const data = await res.json();

    const tmuCenter = [-79.3788, 43.6577];
    function haversine(lon1, lat1, lon2, lat2) {
      const R = 6371000;
      const toRad = (x) => (x * Math.PI) / 180;
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

    data.forEach((washroom) => {
      const lon = washroom.longitude || washroom.lon || washroom.lng;
      const lat = washroom.latitude || washroom.lat;
      if (typeof lon !== "number" || typeof lat !== "number") return;
      const dist = haversine(tmuCenter[0], tmuCenter[1], lon, lat);
      if (dist <= 2000) {
        let popupText =
          '<div style="text-align: center; padding: 8px;"><strong>🚻 Washroom</strong>';
        popupText += `<br><small>Hours: ${washroom.hours || "N/A"}</small>`;
        if (washroom.description) {
          popupText += `<br><small>${washroom.description}</small>`;
        }
        popupText += "</div>";

        // Create custom washroom marker
        const markerElement = createCustomMarker(
          "🚻",
          36,
          "#e8f5e8",
          "#4caf50"
        );

        const marker = new mapboxgl.Marker({
          element: markerElement,
          anchor: "center",
        })
          .setLngLat([lon, lat])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupText))
          .addTo(map);
        washroomMarkers.push(marker);
      }
    });
  } catch (e) {
    console.error("[Washrooms API] Failed to fetch:", e);
  }
}

/**
 * Add this to your geolocation success callback:
 */
function addUserLocationToExistingCode() {
  // Add this inside your existing geolocation code where you set startCoordinates
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        const lng = pos.coords.longitude;
        const lat = pos.coords.latitude;
        startCoordinates = [lng, lat];

        addUserLocationMarker([lng, lat]);

        // ADD THIS LINE: Add red user location marker
        addUserLocationMarker([lng, lat]);

        // Your existing reverse geocoding code...
        fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_API_KEY}&types=address`
        )
          .then((response) => response.json())
          .then((data) => {
            if (data.features && data.features.length > 0) {
              document.getElementById("route-start-search").value =
                data.features[0].place_name;
            }
          })
          .catch((err) => {
            console.warn("[Reverse Geocoding] Error:", err);
            document.getElementById(
              "route-start-search"
            ).value = `Current Location (${lng.toFixed(6)}, ${lat.toFixed(6)})`;
          });
        userLocation = { lng: parseFloat(lng), lat: parseFloat(lat) };
      },
      function (err) {
        console.warn("[Geolocation] Could not get user location:", err);
        userLocation = null;
      }
    );
  }
}
