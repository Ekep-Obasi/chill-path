
// Imports and whatnot
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 9000;

app.use(express.json());

// HTTP Requests thingy for normal routing
app.post('/route', async (req: { body: { start: any; end: any; mode: string; }; }, res: any) => {
  const { start, end, mode } = req.body; // Get the details
  // Start, end, mode of transportation from the request sent

  // Set up the API 
  const mapboxToken = process.env.MAPBOX_TOKEN;
  const url = `https://api.mapbox.com/directions/v5/mapbox/${mode}/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&alternatives=true&steps=true&access_token=${mapboxToken}`;
  // We send the url to MapBox for it to create a route
  // Then send that route for mapbox gls to create on the front-end

  // Try catch statement
  try {
    const response = await axios.get(url) // Use axios to make http requests to mapbox
    const route =  response.data.routes[0] // Object's list of routes (if multiple), then selects the first one
    
    // Now send the stuff, with all the details
    res.json({ 
      geometry: route.geometry,
      duration: route.duration,
      distance: route.distance
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Error fetching route");
  }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
