import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";

// Replace with your Mapbox access token
mapboxgl.accessToken = "sk.eyJ1IjoiYXpyYWZhbG1hcyIsImEiOiJjbWNnazI1YmUwbGhtMnFweDJ3aTZxazQzIn0.y2m1lqFzQFBp3u7oAc64Lg";

// Example route coordinates (longitude, latitude)
const route = [
  [-122.483696, 37.833818],
  [-122.483482, 37.833174],
  [-122.483396, 37.8327],
  [-122.483568, 37.832056],
  [-122.48404, 37.831141],
  [-122.48404, 37.830497],
  [-122.483482, 37.82992],
  [-122.483568, 37.829548],
  [-122.48507, 37.829446],
  [-122.4861, 37.828802],
  [-122.486958, 37.82931],
  [-122.487001, 37.830802],
  [-122.487516, 37.831683],
  [-122.488031, 37.832158],
  [-122.488889, 37.832971],
  [-122.489876, 37.832632],
];

const MapboxRoute: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [-122.486052, 37.830348],
      zoom: 15,
    });

    map.current.on("load", () => {
      map.current!.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: route,
          },
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
  }, []);

  return (
    <div>
      <div
        ref={mapContainer}
        style={{ width: "100%", height: "400px", borderRadius: 12 }}
      />
    </div>
  );
};

export default MapboxRoute;
