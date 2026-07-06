import { StockRepository } from "./stock.repository.js";
import type { CreateStockMovementDTO } from "./stock.schema.js";
import { AppError } from "../../shared/errors/app-error.js";

type StockAlertSeverity = "LOW" | "MEDIUM" | "HIGH";

type StockProduct = {
  id: string;
  name: string;
  sku: string;
  currentStock: number;
  minimumStock: number;
};

export class StockService {
  constructor(private readonly repository = new StockRepository()) {}

  async createMovement(data: CreateStockMovementDTO) {
    const result = await this.repository.createMovementAtomically(data);

    if (result.status === "product_not_found") {
      throw new AppError("Product not found", 404);
    }

    if (result.status === "insufficient_stock") {
      throw new AppError("Insufficient stock", 400);
    }

    return {
      movement: result.movement,
      product: result.product,
    };
  }

  async listMovements() {
    return this.repository.listMovements();
  }

  async getStockAlerts() {
    const products: StockProduct[] =
      await this.repository.findProductsForStockAlerts();

    return products
      .map((product) => {
        const missingQuantity = Math.max(
          product.minimumStock - product.currentStock,
          0
        );

        let severity: StockAlertSeverity = "LOW";
        let message = "Stock level is healthy.";

        if (product.currentStock === 0) {
          severity = "HIGH";
          message = "Product is out of stock.";
        } else if (product.currentStock < product.minimumStock) {
          severity = "HIGH";
          message = "Current stock is below the minimum stock level.";
        } else if (product.currentStock === product.minimumStock) {
          severity = "MEDIUM";
          message = "Current stock has reached the minimum stock level.";
        }

        return {
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          currentStock: product.currentStock,
          minimumStock: product.minimumStock,
          missingQuantity,
          severity,
          message,
        };
      })
      .filter((alert) => alert.severity !== "LOW");
  }
}
