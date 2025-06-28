import express, { Express } from "express";
import { PORT } from "~/constants";
import App from "~/config/app.config";

(async () => {
  const app: Express = express();

  // Basic test route
  app.get("/test", ( req, res) => {
    res.send("Test route is working!");
  });

  await App(app);

  app.listen(PORT, () => {
    console.log(`server is listening to port ${PORT}`);
  });

})();