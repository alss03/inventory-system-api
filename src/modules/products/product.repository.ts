import { prisma } from "../../shared/database/prisma.js";
import { removeUndefined } from "../../shared/utils/remove-undefined.js";
import type { CreateProductDTO, UpdateProductDTO } from "./product.schema.js";

export class ProductRepository {
  async create(data: CreateProductDTO) {
    const { supplierId, ...productData } = data;

    return prisma.product.create({
      data: {
        ...productData,
        ...(supplierId
          ? {
              supplier: {
                connect: {
                  id: supplierId,
                },
              },
            }
          : {}),
      },
    });
  }

  async findAll() {
    return prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        supplier: true,
      },
    });
  }

  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: { supplier: true },
    });
  }

  async update(id: string, data: UpdateProductDTO) {
    const { supplierId, ...productData } = data;

    return prisma.product.update({
      where: { id },
      data: {
        ...removeUndefined(productData),
        ...(supplierId
          ? {
              supplier: {
                connect: { id: supplierId },
              },
            }
          : {}),
      },
    });
  }

  async delete(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  }

  async countStockMovements(productId: string) {
    return prisma.stockMovement.count({
      where: { productId },
    });
  }
}