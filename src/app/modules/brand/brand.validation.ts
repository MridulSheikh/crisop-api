import { z } from 'zod';

const createBrandValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Brand name is required',
    }),
  }),
});

const updateBrandValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    isDeleted: z.boolean().optional(),
  }),
});

export default {
  createBrandValidationSchema,
  updateBrandValidationSchema,
};
