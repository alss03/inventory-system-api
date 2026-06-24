import { z } from "zod";

export const productParamsSchema = z.object({
  id: z.uuid(),
});

export const createProductSchema = z.object({
  name: z.string().min(3),
  sku: z.string().min(2),
  currentStock: z.number().int().nonnegative(),
  minimumStock: z.number().int().nonnegative(),
  unitCost: z.number().positive(),
  supplierId: z.uuid().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export type ProductParamsDTO = z.infer<typeof productParamsSchema>;
export type CreateProductDTO = z.infer<typeof createProductSchema>;
export type UpdateProductDTO = z.infer<typeof updateProductSchema>;