import { z } from 'zod';
import mongoose from 'mongoose';

export const imageSchema = z.object({
  url: z.string().url('Invalid image URL'),
  public_id: z.string().min(1, 'public_id is required'),
});

const booleanFromString = z.preprocess((val) => {
  if (val === 'true') return true;
  if (val === 'false') return false;
  return val;
}, z.boolean());

// Base fields (shared between create/update)
const productBodySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(2000).optional(),
  price: z.preprocess((val) => Number(val), z.number().positive()),
  discountPrice: z.preprocess((val) => Number(val), z.number().positive()),
  stock: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid Stock ID (must be ObjectId)',
  }),
  category: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid Category ID (must be ObjectId)',
  }),
  tags: z.array(z.string().min(1)).optional(),
  isFeatured: booleanFromString.optional().default(false),
  isPublished: booleanFromString.optional().default(false),
});

// CREATE schema: all required (except optional ones)
export const createProductSchema = z.object({
  body: productBodySchema,
});

// UPDATE schema: all fields inside `body` are optional
export const updateProductSchema = z.object({
  body: productBodySchema.partial().extend({
    keepImages: z.array(imageSchema).min(1, 'At least one image is required'),

    removedImages: z
      .array(imageSchema)
      .min(1, 'At least one image is required'),
  }),
});

// TypeScript types
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
