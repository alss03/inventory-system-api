import { prisma } from "../../shared/database/prisma.js";
import type { CreateProductDTO } from "./product.schema.js";

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
}