import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "../../shared/errors/app-error.js";
import { StockService } from "./stock.service.js";
import type { StockRepository } from "./stock.repository.js";

const repository = {
  findProductById: vi.fn(),
  createMovement: vi.fn(),
  updateProductStock: vi.fn(),
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
    it("adds an incoming quantity to the current stock", async () => {
      repository.findProductById.mockResolvedValue({
        id: "product-1",
        currentStock: 10,
      });
      repository.createMovement.mockResolvedValue({ id: "movement-1" });
      repository.updateProductStock.mockResolvedValue({
        id: "product-1",
        currentStock: 15,
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
      expect(repository.createMovement).toHaveBeenCalledWith(data);
      expect(repository.updateProductStock).toHaveBeenCalledWith(
        "product-1",
        15
      );
    });

    it("subtracts an outgoing quantity from the current stock", async () => {
      repository.findProductById.mockResolvedValue({
        id: "product-1",
        currentStock: 10,
      });
      repository.createMovement.mockResolvedValue({ id: "movement-1" });
      repository.updateProductStock.mockResolvedValue({
        id: "product-1",
        currentStock: 6,
      });

      await service.createMovement({
        productId: "product-1",
        type: "OUT",
        quantity: 4,
      });

      expect(repository.updateProductStock).toHaveBeenCalledWith(
        "product-1",
        6
      );
    });

    it("throws when the product does not exist", async () => {
      repository.findProductById.mockResolvedValue(null);

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
      expect(repository.createMovement).not.toHaveBeenCalled();
    });

    it("throws when an outgoing movement would make stock negative", async () => {
      repository.findProductById.mockResolvedValue({
        id: "product-1",
        currentStock: 2,
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
      expect(repository.createMovement).not.toHaveBeenCalled();
      expect(repository.updateProductStock).not.toHaveBeenCalled();
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
