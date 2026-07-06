import { prisma } from "../../shared/database/prisma.js";
import type { CreateStockMovementDTO } from "./stock.schema.js";

export class StockRepository {
  async createMovementAtomically(data: CreateStockMovementDTO) {
    return prisma.$transaction(async (transaction) => {
      const stockUpdate =
        data.type === "OUT"
          ? await transaction.product.updateMany({
              where: {
                id: data.productId,
                currentStock: {
                  gte: data.quantity,
                },
              },
              data: {
                currentStock: {
                  decrement: data.quantity,
                },
              },
            })
          : await transaction.product.updateMany({
              where: {
                id: data.productId,
              },
              data: {
                currentStock: {
                  increment: data.quantity,
                },
              },
            });

      if (stockUpdate.count === 0) {
        if (data.type === "IN") {
          return { status: "product_not_found" as const };
        }

        const product = await transaction.product.findUnique({
          where: { id: data.productId },
          select: { id: true },
        });

        return product
          ? { status: "insufficient_stock" as const }
          : { status: "product_not_found" as const };
      }

      const { reason, ...movementData } = data;
      const movement = await transaction.stockMovement.create({
        data: {
          ...movementData,
          ...(reason ? { reason } : {}),
        },
      });
      const product = await transaction.product.findUniqueOrThrow({
        where: { id: data.productId },
      });

      return {
        status: "created" as const,
        movement,
        product,
      };
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
