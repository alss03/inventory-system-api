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
    const product = await this.repository.findProductById(data.productId);

    if (!product) {
      throw new AppError("Product not found", 404);
    }

    const newStock =
      data.type === "IN"
        ? product.currentStock + data.quantity
        : product.currentStock - data.quantity;

    if (newStock < 0) {
      throw new AppError("Insufficient stock", 400);
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