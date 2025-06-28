import express, { Express } from "express";
import { PORT } from "~/constants";
import App from "~/config/app.config";

(async () => {
  const app: Express = express();

  await App(app);

  app.listen(PORT, () => {
    console.log(`server is listening to port ${PORT}`);
  });
})();