"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleStatusValidationSchema = exports.createOrderSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
exports.createOrderSchema = zod_1.z.object({
    body: zod_1.z.object({
        customer: zod_1.z
            .string()
            .refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), {
            message: 'Invalid customer ID',
        }),
        shippingInfo: zod_1.z.object({
            addressOneLine: zod_1.z.string().min(1, 'Address is required'),
            type: zod_1.z.enum(['Standard', '24h', '3d']).default('Standard'),
            contact: zod_1.z.string().min(11, 'Invalid contact number'),
            email: zod_1.z.string().email('Invalid email'),
            division: zod_1.z.string().min(3, "Invalid Division")
        }),
        items: zod_1.z
            .array(zod_1.z.object({
            product: zod_1.z
                .string()
                .refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), {
                message: 'Invalid product ID',
            }),
            quantity: zod_1.z.number().min(1),
            price: zod_1.z.number().positive(),
        }))
            .min(1, 'Order must have at least 1 item'),
        isCod: zod_1.z.boolean().default(false),
        isPaymentComplete: zod_1.z.boolean().default(false),
        status: zod_1.z
            .enum(['pending', 'packing', 'shipped', 'delivered'])
            .default('pending'),
        isCancel: zod_1.z.boolean().default(false),
        total: zod_1.z.number().positive()
    }),
});
exports.toggleStatusValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z
            .enum(['pending', 'packing', 'shipped', 'delivered'])
            .default('pending'),
    }),
});
