import { z } from "zod";

export const createStockMovementSchema = z.object({
  productId: z.uuid(),
  type: z.enum(["IN", "OUT"]),
  quantity: z.number().int().positive(),
  reason: z.string().optional(),
});

export type CreateStockMovementDTO = z.infer<
  typeof createStockMovementSchema
>;