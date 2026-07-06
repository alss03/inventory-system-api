import { beforeEach, describe, expect, it, vi } from "vitest";
import { prisma } from "../../shared/database/prisma.js";
import { StockRepository } from "./stock.repository.js";

vi.mock("../../shared/database/prisma.js", () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

const transaction = {
  product: {
    updateMany: vi.fn(),
    findUnique: vi.fn(),
    findUniqueOrThrow: vi.fn(),
  },
  stockMovement: {
    create: vi.fn(),
  },
};

describe("StockRepository", () => {
  const repository = new StockRepository();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) =>
      callback(transaction as never)
    );
  });

  describe("createMovementAtomically", () => {
    it("increments stock and creates an incoming movement in one transaction", async () => {
      transaction.product.updateMany.mockResolvedValue({ count: 1 });
      transaction.stockMovement.create.mockResolvedValue({
        id: "movement-1",
      });
      transaction.product.findUniqueOrThrow.mockResolvedValue({
        id: "product-1",
        currentStock: 15,
      });

      await expect(
        repository.createMovementAtomically({
          productId: "product-1",
          type: "IN",
          quantity: 5,
          reason: "Restock",
        })
      ).resolves.toEqual({
        status: "created",
        movement: { id: "movement-1" },
        product: { id: "product-1", currentStock: 15 },
      });

      expect(transaction.product.updateMany).toHaveBeenCalledWith({
        where: { id: "product-1" },
        data: {
          currentStock: {
            increment: 5,
          },
        },
      });
      expect(transaction.stockMovement.create).toHaveBeenCalledWith({
        data: {
          productId: "product-1",
          type: "IN",
          quantity: 5,
          reason: "Restock",
        },
      });
      expect(transaction.product.findUniqueOrThrow).toHaveBeenCalledWith({
        where: { id: "product-1" },
      });
    });

    it("decrements stock only when an outgoing quantity is available", async () => {
      transaction.product.updateMany.mockResolvedValue({ count: 1 });
      transaction.stockMovement.create.mockResolvedValue({
        id: "movement-1",
      });
      transaction.product.findUniqueOrThrow.mockResolvedValue({
        id: "product-1",
        currentStock: 6,
      });

      await repository.createMovementAtomically({
        productId: "product-1",
        type: "OUT",
        quantity: 4,
      });

      expect(transaction.product.updateMany).toHaveBeenCalledWith({
        where: {
          id: "product-1",
          currentStock: {
            gte: 4,
          },
        },
        data: {
          currentStock: {
            decrement: 4,
          },
        },
      });
    });

    it("returns insufficient stock without creating a movement", async () => {
      transaction.product.updateMany.mockResolvedValue({ count: 0 });
      transaction.product.findUnique.mockResolvedValue({ id: "product-1" });

      await expect(
        repository.createMovementAtomically({
          productId: "product-1",
          type: "OUT",
          quantity: 20,
        })
      ).resolves.toEqual({ status: "insufficient_stock" });

      expect(transaction.stockMovement.create).not.toHaveBeenCalled();
      expect(transaction.product.findUniqueOrThrow).not.toHaveBeenCalled();
    });

    it("returns product not found for a missing outgoing product", async () => {
      transaction.product.updateMany.mockResolvedValue({ count: 0 });
      transaction.product.findUnique.mockResolvedValue(null);

      await expect(
        repository.createMovementAtomically({
          productId: "missing-product",
          type: "OUT",
          quantity: 1,
        })
      ).resolves.toEqual({ status: "product_not_found" });

      expect(transaction.stockMovement.create).not.toHaveBeenCalled();
    });

    it("returns product not found for a missing incoming product", async () => {
      transaction.product.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        repository.createMovementAtomically({
          productId: "missing-product",
          type: "IN",
          quantity: 1,
        })
      ).resolves.toEqual({ status: "product_not_found" });

      expect(transaction.product.findUnique).not.toHaveBeenCalled();
      expect(transaction.stockMovement.create).not.toHaveBeenCalled();
    });
  });
});
