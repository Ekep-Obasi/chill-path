import "tsconfig-paths/register";
import express, { Express } from "express";
import { PORT } from "./constants";
import App from "./config/app.config";

// Route directories
const distance_only = require("./routes/distance_only");
const duration_only = require("./routes/duration_only");
const mapping = require("./routes/mapping");
import { getFountains, getPackageData } from "./routes/get_fountains";
import { getBenches } from "./routes/get_benches";
import { getWashrooms } from "./routes/get_washrooms";

(async () => {
  const app: Express = express();

  await App(app);

  app.use("/mapping", mapping);
  app.use("/distance_only", distance_only);
  app.use("/duration_only", duration_only);

  // Use the route handlers
  app.get("/fountains", getFountains);
  app.get("/benches", getBenches);
  app.get("/washrooms", getWashrooms);

  app.listen(PORT, () => {
    console.log(`server is listening to port ${PORT}`);
  });
})();
