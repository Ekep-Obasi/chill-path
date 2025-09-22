# Chill Path

<p align="center">
  <img src="chillpathimage.png" alt="Image Demo" width="1000"/>
</p>

This project was submitted to 2025 SolutionHacks Hackathon.

Chill Path is a smart routing web application designed to help users find the most shaded and comfortable walking routes during extreme heat. Inspired by the growing global concern over heat-related deaths and the recent Toronto heat wave, Chill Path empowers people (especially vulnerable groups like elders and individuals with accessibility needs) to safely enjoy outdoor activities by avoiding direct sun exposure and locating essential public amenities.

## Features

**Shade-Aware Routing**  
Uses real-time sun angle and building geometry to calculate shaded areas.

**Optimized Paths with Dijkstra’s Algorithm**  
Applies custom weighting to prioritize shade in route calculation.

**Public Amenities Overlay**  
Displays water fountains, benches, and washrooms sourced from the City of Toronto’s Open Data.

**Hydration Guide**  
Estimates water needed for the walk based on route length and temperature (planned feature).

## Tech Stack

## Frontend
- **HTML, CSS, JavaScript**: Core web technologies for UI and interactivity
- **Mapbox GL JS**: Interactive maps and geospatial visualization

## Backend
- **Node.js**: JavaScript runtime for backend services
- **Turf.js**: Geospatial calculations and analysis
- **SunCalc.js**: Sun position and shadow calculations
- **TypeScript**: Strongly-typed JavaScript for backend code
- **Python**: Used for chatbot and hydration microservices

## Other/Supporting
- **pnpm**: Fast, disk space-efficient package manager for Node.js
- **OpenStreetMap/Overpass API**: Source for building and amenity data
- **Custom shade calculation logic**: JavaScript-based, for dynamic shade rendering
- **REST APIs**: For routing, amenities, and shade data


## Architecture

**Shade Detection**  
ShadeMap is used to visualize the building shadow polygons based on current sun position.  
Geographic coordinates are assessed to determine whether they fall in shade.

**Routing Algorithm**  
Routes between two points are computed using Dijkstra’s algorithm.  
Each edge (path segment) is weighted based on sun exposure, with shaded segments preferred.

**Amenity Integration**  
Amenities such as fountains, washrooms, and benches are retrieved and plotted on the map.  
These are displayed alongside the route to assist in planning breaks.

## Key Challenges

Accurate mathematical modeling of building shadows using polygons  
Spatial analysis to determine whether a coordinate lies in shade  
Implementing and integrating a custom Dijkstra’s algorithm with real-world geospatial data  
Ensuring smooth backend-frontend communication via secure API calls

## Accomplishments

Successfully built a working prototype that generates least-sun-exposed routes in real time  
Integrated public amenity data and visualized it meaningfully  
Developed a modular and extensible architecture for future features

## Future Enhancements

**Mobile App**  
Real-time GPS-based navigation

**Temperature-Based Risk Assessment**  
Show perceived temperature on route segments

**User Accounts**  
Save and track past and favorite routes

**Amenity Prioritized Routing**  
Customize routes based on user needs for amenities
