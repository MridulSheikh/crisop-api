import { z } from 'zod';
import mongoose from 'mongoose';

export const createOrderSchema = z.object({
  body: z.object({
    customer: z
      .string()
      .refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: 'Invalid customer ID',
      }),

    shippingInfo: z.object({
      addressOneLine: z.string().min(1, 'Address is required'),
      type: z.enum(['Standard', '24h', '3d']).default('Standard'),
      contact: z.string().min(11, 'Invalid contact number'),
      email: z.string().email('Invalid email'),
      division: z.string().min(3, "Invalid Division")
    }),

    items: z
      .array(
        z.object({
          product: z
            .string()
            .refine((val) => mongoose.Types.ObjectId.isValid(val), {
              message: 'Invalid product ID',
            }),
          quantity: z.number().min(1),
          price: z.number().positive(),
        }),
      )
      .min(1, 'Order must have at least 1 item'),

    isCod: z.boolean().default(false),
    isPaymentComplete: z.boolean().default(false),

    status: z
      .enum(['pending', 'packing', 'shipped', 'delivered'])
      .default('pending'),

    isCancel: z.boolean().default(false),
    total: z.number().positive()
  }),
});

export const toggleStatusValidationSchema = z.object({
  body: z.object({
    status: z
      .enum(['pending', 'packing', 'shipped', 'delivered'])
      .default('pending'),
  }),
});
