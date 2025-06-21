import { z } from 'zod';
import mongoose from 'mongoose';

// Base fields (shared between create/update)
const productBodySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional(),
  price: z.number().positive('Price must be greater than 0'),
  discountPrice: z.number().positive().optional(),
  stock: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid Stock ID (must be ObjectId)',
  }),
  category: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid Category ID (must be ObjectId)',
  }),
  tags: z.array(z.string().min(1)).optional(),
  images: z
    .array(z.string().url('Invalid image URL'))
    .min(1, 'At least 1 image is required'),
  isFeatured: z.boolean().optional().default(false),
  isDeleted: z.boolean().default(false),
  isPublished: z.boolean().default(false),
});

// CREATE schema: all required (except optional ones)
export const createProductSchema = z.object({
  body: productBodySchema,
});

// UPDATE schema: all fields inside `body` are optional
export const updateProductSchema = z.object({
  body: productBodySchema.partial(),
});

// TypeScript types
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
