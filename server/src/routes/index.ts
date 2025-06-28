import { Application, Request, Response } from "express";

export const routesInit = (app: Application) => {
  app.use("/health-check", (req: Request, res: Response) => {
    res.send("Healthy ✅");
  });
};
