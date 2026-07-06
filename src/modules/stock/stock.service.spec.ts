import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../shared/errors/app-error.js";
import { StockService } from "./stock.service.js";
import type { StockRepository } from "./stock.repository.js";

const repository = {
  createMovementAtomically: vi.fn(),
  findProductsForStockAlerts: vi.fn(),
  listMovements: vi.fn(),
};

describe("StockService", () => {
  let service: StockService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new StockService(repository as unknown as StockRepository);
  });

  describe("createMovement", () => {
    it("returns the movement and updated product from the atomic operation", async () => {
      repository.createMovementAtomically.mockResolvedValue({
        status: "created",
        movement: { id: "movement-1" },
        product: {
          id: "product-1",
          currentStock: 15,
        },
      });

      const data = {
        productId: "product-1",
        type: "IN" as const,
        quantity: 5,
        reason: "Restock",
      };

      await expect(service.createMovement(data)).resolves.toEqual({
        movement: { id: "movement-1" },
        product: { id: "product-1", currentStock: 15 },
      });
      expect(repository.createMovementAtomically).toHaveBeenCalledWith(data);
    });

    it("maps a missing product result to a 404 error", async () => {
      repository.createMovementAtomically.mockResolvedValue({
        status: "product_not_found",
      });

      const promise = service.createMovement({
        productId: "missing-product",
        type: "IN",
        quantity: 1,
      });

      await expect(promise).rejects.toBeInstanceOf(AppError);
      await expect(promise).rejects.toMatchObject({
        message: "Product not found",
        statusCode: 404,
      });
    });

    it("maps an insufficient stock result to a 400 error", async () => {
      repository.createMovementAtomically.mockResolvedValue({
        status: "insufficient_stock",
      });

      const promise = service.createMovement({
        productId: "product-1",
        type: "OUT",
        quantity: 3,
      });

      await expect(promise).rejects.toBeInstanceOf(AppError);
      await expect(promise).rejects.toMatchObject({
        message: "Insufficient stock",
        statusCode: 400,
      });
    });
  });

  it("returns the movements provided by the repository", async () => {
    const movements = [{ id: "movement-1" }, { id: "movement-2" }];
    repository.listMovements.mockResolvedValue(movements);

    await expect(service.listMovements()).resolves.toBe(movements);
    expect(repository.listMovements).toHaveBeenCalledOnce();
  });

  it("returns only medium and high stock alerts", async () => {
    repository.findProductsForStockAlerts.mockResolvedValue([
      {
        id: "out",
        name: "Out of stock",
        sku: "OUT-1",
        currentStock: 0,
        minimumStock: 5,
      },
      {
        id: "minimum",
        name: "At minimum",
        sku: "MIN-1",
        currentStock: 3,
        minimumStock: 3,
      },
      {
        id: "healthy",
        name: "Healthy",
        sku: "OK-1",
        currentStock: 10,
        minimumStock: 3,
      },
    ]);

    await expect(service.getStockAlerts()).resolves.toEqual([
      expect.objectContaining({
        productId: "out",
        missingQuantity: 5,
        severity: "HIGH",
        message: "Product is out of stock.",
      }),
      expect.objectContaining({
        productId: "minimum",
        missingQuantity: 0,
        severity: "MEDIUM",
        message: "Current stock has reached the minimum stock level.",
      }),
    ]);
  });
});
