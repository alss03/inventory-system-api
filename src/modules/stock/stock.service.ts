import { StockRepository } from "./stock.repository.js";
import type { CreateStockMovementDTO } from "./stock.schema.js";

export class StockService {
  constructor(private readonly repository = new StockRepository()) {}

  async createMovement(data: CreateStockMovementDTO) {
    const product = await this.repository.findProductById(data.productId);

    if (!product) {
      throw new Error("Product not found");
    }

    const newStock =
      data.type === "IN"
        ? product.currentStock + data.quantity
        : product.currentStock - data.quantity;

    if (newStock < 0) {
      throw new Error("Insufficient stock");
    }

    const movement = await this.repository.createMovement(data);

    const updatedProduct = await this.repository.updateProductStock(
      data.productId,
      newStock
    );

    return {
      movement,
      product: updatedProduct,
    };
  }

  async listMovements() {
    return this.repository.listMovements();
  }
}