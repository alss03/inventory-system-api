import type { FastifyReply, FastifyRequest } from "fastify";
import { StockService } from "./stock.service.js";
import { createStockMovementSchema } from "./stock.schema.js";

const stockService = new StockService();

export class StockController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createStockMovementSchema.parse(request.body);

    const result = await stockService.createMovement(data);

    return reply.status(201).send(result);
  }

  async list(_request: FastifyRequest, reply: FastifyReply) {
    const movements = await stockService.listMovements();

    return reply.send(movements);
  }

  async alerts(_request: FastifyRequest, reply: FastifyReply) {
    const alerts = await stockService.getStockAlerts();

    return reply.send(alerts);
  }
}