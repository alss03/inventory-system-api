import { prisma } from "../../shared/database/prisma.js";
import type { CreateStockMovementDTO } from "./stock.schema.js";

export class StockRepository {
  async findProductById(productId: string) {
    return prisma.product.findUnique({
      where: { id: productId },
    });
  }

  async createMovement(data: CreateStockMovementDTO) {
    const { reason, ...movementData } = data;

    return prisma.stockMovement.create({
        data: {
            ...movementData,
            ...(reason ? { reason } : {}),
        },
    });
  }

  async updateProductStock(productId: string, newStock: number) {
    return prisma.product.update({
      where: { id: productId },
      data: {
        currentStock: newStock,
      },
    });
  }

  async findProductsForStockAlerts() {
    return prisma.product.findMany({
      orderBy: {
        currentStock: "asc",
      },
    });
  }

  async listMovements() {
    return prisma.stockMovement.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        product: true,
      },
    });
  }
}