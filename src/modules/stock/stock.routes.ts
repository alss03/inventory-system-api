import type { FastifyInstance } from "fastify";
import { StockController } from "./stock.controller.js";

const stockController = new StockController();

export async function stockRoutes(app: FastifyInstance) {
  app.post("/stock-movements", stockController.create);
  app.get("/stock-movements", stockController.list);
}