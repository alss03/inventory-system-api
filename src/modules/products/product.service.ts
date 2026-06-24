import { AppError } from "../../shared/errors/app-error.js";
import { ProductRepository } from "./product.repository.js";
import type {
  CreateProductDTO,
  UpdateProductDTO,
} from "./product.schema.js";

export class ProductService {
  constructor(private readonly repository = new ProductRepository()) {}

  async create(data: CreateProductDTO) {
    return this.repository.create(data);
  }

  async list() {
    return this.repository.findAll();
  }

  async findById(id: string) {
    const product = await this.repository.findById(id);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    return product;
  }

  async update(id: string, data: UpdateProductDTO) {
    await this.findById(id);

    return this.repository.update(id, data);
  }

  async delete(id: string) {
    await this.findById(id);

    const movementsCount = await this.repository.countStockMovements(id);

    if (movementsCount > 0) {
      throw new AppError(
        "Cannot delete product with stock movement history",
        409
      );
    }

    await this.repository.delete(id);

    return {
      message: "Product deleted successfully",
    };
  }
}