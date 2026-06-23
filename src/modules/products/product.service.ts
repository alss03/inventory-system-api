import { ProductRepository } from "./product.repository.js";
import type { CreateProductDTO } from "./product.schema.js";

export class ProductService {
  constructor(private readonly repository = new ProductRepository()) {}

  async create(data: CreateProductDTO) {
    return this.repository.create(data);
  }

  async list() {
    return this.repository.findAll();
  }
}