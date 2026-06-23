import type { FastifyReply, FastifyRequest } from "fastify";
import { ProductService } from "./product.service.js";
import { createProductSchema } from "./product.schema.js";

const productService = new ProductService();

export class ProductController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const data = createProductSchema.parse(request.body);

    const product = await productService.create(data);

    return reply.status(201).send(product);
  }

  async list(_request: FastifyRequest, reply: FastifyReply) {
    const products = await productService.list();

    return reply.send(products);
  }
}