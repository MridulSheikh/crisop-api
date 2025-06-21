import { z } from 'zod';

export const createStockValidationSchema = z.object({
  body: z.object({
    productName: z.string().min(1, 'Product name is required'),
    quantity: z.number().min(0, 'Quantity must be non-negative'),
    warehouse: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid warehouse ObjectId'),
  }),
});

export const updateStockValidationSchema = z.object({
  body: z.object({
    productName: z.string().min(1, 'Product name is required'),
    quantity: z.number().min(0, 'Quantity must be non-negative'),
    warehouse: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid warehouse ObjectId'),
  }).partial(),
});
