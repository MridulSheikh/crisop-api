"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStockValidationSchema = exports.createStockValidationSchema = void 0;
const zod_1 = require("zod");
exports.createStockValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        productName: zod_1.z.string().min(1, 'Product name is required'),
        quantity: zod_1.z.number().min(0, 'Quantity must be non-negative'),
        unit: zod_1.z.string().min(1, 'Product name is required'),
        warehouse: zod_1.z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, 'Invalid warehouse ObjectId'),
    }),
});
exports.updateStockValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        productName: zod_1.z.string().min(1, 'Product name is required'),
        quantity: zod_1.z.number().min(0, 'Quantity must be non-negative'),
        unit: zod_1.z.string().min(1, 'Product name is required'),
        warehouse: zod_1.z
            .string()
            .regex(/^[0-9a-fA-F]{24}$/, 'Invalid warehouse ObjectId'),
    }).partial(),
});
