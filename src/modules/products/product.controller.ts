import type { FastifyReply, FastifyRequest } from "fastify";
import { ProductService } from "./product.service.js";
import {
  createProductSchema,
  productParamsSchema,
  updateProductSchema,
} from "./product.schema.js";

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

  async findById(request: FastifyRequest, reply: FastifyReply) {
    const { id } = productParamsSchema.parse(request.params);

    const product = await productService.findById(id);

    return reply.send(product);
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const { id } = productParamsSchema.parse(request.params);
    const data = updateProductSchema.parse(request.body);

    const product = await productService.update(id, data);

    return reply.send(product);
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const { id } = productParamsSchema.parse(request.params);

    const result = await productService.delete(id);

    return reply.send(result);
  }
}