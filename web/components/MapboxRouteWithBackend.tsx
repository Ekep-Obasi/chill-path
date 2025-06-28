import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken = "sk.eyJ1IjoiYXpyYWZhbG1hcyIsImEiOiJjbWNnazI1YmUwbGhtMnFweDJ3aTZxazQzIn0.y2m1lqFzQFBp3u7oAc64Lg";

const start = [-122.483696, 37.833818];
const end = [-122.489876, 37.832632];
const mode = "walking";
const BACKEND_URL = "http://localhost:9000/route"; // Change port if needed

const MapboxRouteWithBackend: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [route, setRoute] = useState<any>(null);

  useEffect(() => {
    fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start, end, mode }),
    })
      .then((res) => res.json())
      .then((data) => setRoute(data.geometry))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!route || map.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v11",
      center: start,
      zoom: 14,
    });

    map.current.on("load", () => {
      map.current!.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: route,
        },
      });
      map.current!.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#3b82f6",
          "line-width": 6,
        },
      });
    });
  }, [route]);

  return (
    <div>
      <div
        ref={mapContainer}
        style={{ width: "100%", height: "400px", borderRadius: 12 }}
      />
    </div>
  );
};

export default MapboxRouteWithBackend;
