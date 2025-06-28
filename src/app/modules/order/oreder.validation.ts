import { z } from 'zod';
import mongoose from 'mongoose';

export const createOrderSchema = z.object({
  body: z.object({
    shippingInfo: z.object({
      addressOneLine: z.string().min(1),
      type: z.enum(['Standard', '24h', '3d']),
      contact: z.string().min(6), // or use regex for phone number
    }),
    items: z.array(z.object({
      product: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
        message: 'Invalid product ID',
      }),
      quantity: z.number().min(1),
      price: z.number().positive(),
      discountPrice: z.number().nonnegative(),
    })),
    status: z.enum(['pending', 'packing', 'shipped', 'delivered']).default("pending"),
    isCancel: z.boolean().default(false),
  })
});


export const toggleStatusValidationSchema = z.object({
  body: z.object({
     status: z.enum(['pending', 'packing', 'shipped', 'delivered']).default("pending"),
  })
})