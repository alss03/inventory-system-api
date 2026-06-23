import Fastify from "fastify";
import cors from "@fastify/cors";
import { productRoutes } from "./modules/products/product.routes.js";

const app = Fastify({
  logger: true,
});

app.register(cors, {
  origin: true,
});

app.get("/health", async () => {
  return {
    status: "ok",
    service: "clinicops-ai-api",
  };
});

app.register(productRoutes);

const start = async () => {
  try {
    await app.listen({
      port: 3333,
      host: "0.0.0.0",
    });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();