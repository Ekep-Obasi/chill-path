import { Application, Request, Response } from "express";

export const routesInit = (app: Application) => {
  app.use("/poop", (req: Request, res: Response) => {
    res.send("Healthy ✅");
  });
};
