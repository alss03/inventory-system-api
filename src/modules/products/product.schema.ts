import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(3),
  sku: z.string().min(2),
  currentStock: z.number().int().nonnegative(),
  minimumStock: z.number().int().nonnegative(),
  unitCost: z.number().positive(),
  supplierId: z.string().uuid().optional(),
});

export type CreateProductDTO = z.infer<typeof createProductSchema>;