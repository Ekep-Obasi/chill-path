import express from "express";
const axios = require("axios");
const router = express.Router();

// POST /distance_only
router.post("/", async (req, res) => {
  const { start, end, mode } = req.body;
  const mapboxToken = process.env.MAPBOX_TOKEN;
  const url = `https://api.mapbox.com/directions/v5/mapbox/${mode}/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&alternatives=true&steps=true&access_token=${mapboxToken}`;
  try {
    const response = await axios.get(url);
    const route = response.data.routes[0];
    res.json({
      geometry: route.geometry,
      duration: route.duration,
      distance: route.distance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching distance");
  }
});

module.exports = router;
