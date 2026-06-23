import type { FastifyInstance } from "fastify";
import { ProductController } from "./product.controller.js";

const productController = new ProductController();

export async function productRoutes(app: FastifyInstance) {
  app.post("/products", productController.create);
  app.get("/products", productController.list);
}