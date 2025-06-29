/**
 * Routing System - Handles route calculation and pathfinding
 */

window.RoutingSystem = class {
  constructor(mapManager, shadeSystem) {
    this.mapManager = mapManager;
    this.shadeSystem = shadeSystem;
  }

  /**
   * Fetch highway network data
   */
  async fetchHighwayNetwork() {
    try {
      const center = window.CONFIG.LOCATION.CENTER;
      const delta = window.CONFIG.LOCATION.BUILDING_FETCH_DELTA;

      const bbox = [
        center.lat - delta, // south
        center.lng - delta, // west
        center.lat + delta, // north
        center.lng + delta, // east
      ];

      const query = `
        [out:json][timeout:25];
        (
          way["highway"](${bbox.join(",")});
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
      return this.processHighwayData(data);
    } catch (error) {
      console.error("Error fetching highway network:", error);
      return [];
    }
  }

  /**
   * Process highway data and calculate shade weights
   */
  processHighwayData(data) {
    const nodes = {};
    const lineFeatures = [];

    // First pass: collect all nodes
    for (const element of data.elements) {
      if (element.type === "node") {
        nodes[element.id] = { lat: element.lat, lon: element.lon };
      }
    }

    // Second pass: process ways (highways)
    for (const element of data.elements) {
      if (element.type === "way" && element.nodes) {
        const coordinates = element.nodes.map((id) => [
          nodes[id].lon,
          nodes[id].lat,
        ]);

        if (coordinates.length > 1) {
          // Calculate shade analysis for this highway segment
          const shadeAnalysis = this.analyzeSegmentShade(coordinates);

          lineFeatures.push({
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: coordinates,
            },
            properties: {
              weight: shadeAnalysis.weight,
              shadeRatio: shadeAnalysis.shadeRatio,
              highway: element.tags?.highway || "unknown",
            },
          });
        }
      }
    }

    window.log(`Processed ${lineFeatures.length} highway segments`);
    return lineFeatures;
  }

  /**
   * Analyze shade coverage for a highway segment
   */
  analyzeSegmentShade(coordinates) {
    if (!window.turf || coordinates.length < 2) {
      return { weight: 1, shadeRatio: 0 };
    }

    try {
      const line = turf.lineString(coordinates);
      const lineLength = turf.length(line);
      const sampleCount = Math.max(2, Math.floor(lineLength * 20));

      let shadedSamples = 0;
      let totalSamples = 0;

      for (let i = 0; i <= sampleCount; i++) {
        const point = turf.along(line, (lineLength * i) / sampleCount);
        totalSamples++;

        if (this.shadeSystem.isPointShaded(point.geometry.coordinates)) {
          shadedSamples++;
        }
      }

      const shadeRatio = totalSamples > 0 ? shadedSamples / totalSamples : 0;
      const weight = 1 + 2 * (1 - shadeRatio); // Lower weight for more shade

      return { weight, shadeRatio };
    } catch (error) {
      console.error("Error analyzing segment shade:", error);
      return { weight: 1, shadeRatio: 0 };
    }
  }

  /**
   * Render highway network on map
   */
  async renderHighwayNetwork() {
    try {
      const highwayFeatures = await this.fetchHighwayNetwork();
      this.mapManager.renderHighways(highwayFeatures);

      window.log(
        `Highway network rendered with ${highwayFeatures.length} segments`,
      );
      return highwayFeatures;
    } catch (error) {
      console.error("Error rendering highway network:", error);
      throw error;
    }
  }

  /**
   * Find shadiest path using Dijkstra's algorithm
   */
  async findShadiestPath(startCoordinates, endCoordinates) {
    try {
      // Fetch highway network data (but don't render it visually)
      const highwayFeatures = await this.fetchHighwayNetwork();
      // Note: We're NOT calling this.mapManager.renderHighways(highwayFeatures) here

      // Build graph from highway features
      const graph = this.buildGraphFromHighways(highwayFeatures);

      // Find nearest nodes to start and end points
      const startNodeId = this.findNearestNode(startCoordinates, graph.nodes);
      const endNodeId = this.findNearestNode(endCoordinates, graph.nodes);

      if (!startNodeId || !endNodeId) {
        throw new Error(
          "Could not find nearest graph nodes for start/end points",
        );
      }

      // Run Dijkstra's algorithm
      const pathNodeIds = this.dijkstra(
        graph.nodes,
        graph.edges,
        startNodeId,
        endNodeId,
      );

      if (pathNodeIds.length === 0) {
        throw new Error("No path found between the selected points");
      }

      // Convert node IDs to coordinates
      const pathCoordinates = pathNodeIds.map((id) => graph.nodes[id]);

      // Calculate path statistics
      const pathStats = this.calculatePathStatistics(pathNodeIds, graph.edges);

      // Render the shady path
      this.mapManager.renderShadyPath(pathCoordinates);

      window.log(
        `Shady path found. Average shade: ${window.formatNumber(pathStats.avgShade * 100)}%`,
      );

      return {
        coordinates: pathCoordinates,
        shadeRating: pathStats.avgShade,
        totalWeight: pathStats.totalWeight,
        message: `Shady path found! Average shade coverage: ${window.formatNumber(pathStats.avgShade * 100)}%`,
      };
    } catch (error) {
      console.error("Error finding shadiest path:", error);
      throw error;
    }
  }

  /**
   * Build graph structure from highway features
   */
  buildGraphFromHighways(features) {
    const nodes = {};
    const edges = {};
    let nodeId = 0;
    const coordToId = {};

    // Assign unique IDs to all coordinates
    for (const feature of features) {
      const coordinates = feature.geometry.coordinates;
      for (const coord of coordinates) {
        const key = coord.join(",");
        if (!(key in coordToId)) {
          const id = nodeId.toString();
          coordToId[key] = id;
          nodes[id] = coord;
          edges[id] = [];
          nodeId++;
        }
      }
    }

    // Add edges between connected nodes
    for (const feature of features) {
      const coordinates = feature.geometry.coordinates;
      const weight = feature.properties.weight || 1;
      const shadeRatio = feature.properties.shadeRatio || 0;

      for (let i = 0; i < coordinates.length - 1; i++) {
        const nodeA = coordToId[coordinates[i].join(",")];
        const nodeB = coordToId[coordinates[i + 1].join(",")];

        edges[nodeA].push({ to: nodeB, weight, shadeRatio });
        edges[nodeB].push({ to: nodeA, weight, shadeRatio });
      }
    }

    return { nodes, edges };
  }

  /**
   * Find nearest node to given coordinates
   */
  findNearestNode(coordinates, nodes) {
    let minDistance = Infinity;
    let nearestNodeId = null;

    for (const [nodeId, nodeCoords] of Object.entries(nodes)) {
      const distance = window.GeoUtils.getDistance(coordinates, nodeCoords);
      if (distance < minDistance) {
        minDistance = distance;
        nearestNodeId = nodeId;
      }
    }

    return nearestNodeId;
  }

  /**
   * Dijkstra's shortest path algorithm
   */
  dijkstra(nodes, edges, startId, endId) {
    const distances = {};
    const previous = {};
    const visited = {};
    const unvisited = new Set(Object.keys(nodes));

    // Initialize distances
    for (const nodeId in nodes) {
      distances[nodeId] = Infinity;
      previous[nodeId] = null;
    }
    distances[startId] = 0;

    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let currentNode = null;
      let minDistance = Infinity;

      for (const nodeId of unvisited) {
        if (distances[nodeId] < minDistance) {
          minDistance = distances[nodeId];
          currentNode = nodeId;
        }
      }

      if (currentNode === null || currentNode === endId) {
        break;
      }

      unvisited.delete(currentNode);
      visited[currentNode] = true;

      // Update distances to neighbors
      for (const edge of edges[currentNode]) {
        if (visited[edge.to]) continue;

        const alternativeDistance = distances[currentNode] + edge.weight;

        if (alternativeDistance < distances[edge.to]) {
          distances[edge.to] = alternativeDistance;
          previous[edge.to] = currentNode;
        }
      }
    }

    // Reconstruct path
    const path = [];
    let currentNode = endId;

    while (currentNode && previous[currentNode] !== null) {
      path.unshift(currentNode);
      currentNode = previous[currentNode];
    }

    if (currentNode === startId) {
      path.unshift(startId);
    }

    return path;
  }

  /**
   * Calculate statistics for a path
   */
  calculatePathStatistics(pathNodeIds, edges) {
    let totalWeight = 0;
    let totalShade = 0;
    let segmentCount = 0;

    for (let i = 0; i < pathNodeIds.length - 1; i++) {
      const fromNode = pathNodeIds[i];
      const toNode = pathNodeIds[i + 1];

      const edge = edges[fromNode].find((e) => e.to === toNode);

      if (edge) {
        totalWeight += edge.weight;
        totalShade += edge.shadeRatio;
        segmentCount++;
      }
    }

    return {
      totalWeight,
      avgShade: segmentCount > 0 ? totalShade / segmentCount : 0,
      segmentCount,
    };
  }
};
