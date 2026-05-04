"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProductSchema = exports.createProductSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = __importDefault(require("mongoose"));
const normalizeArray_1 = require("../../utils/normalizeArray");
const booleanFromString = zod_1.z.preprocess((val) => {
    if (val === 'true')
        return true;
    if (val === 'false')
        return false;
    return val;
}, zod_1.z.boolean());
// Base fields (shared between create/update)
const productBodySchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(100),
    description: zod_1.z.string().max(2000).optional(),
    price: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().positive()),
    discountPrice: zod_1.z.preprocess((val) => Number(val), zod_1.z.number().positive()),
    stock: zod_1.z.string().refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), {
        message: 'Invalid Stock ID (must be ObjectId)',
    }),
    category: zod_1.z.string().refine((val) => mongoose_1.default.Types.ObjectId.isValid(val), {
        message: 'Invalid Category ID (must be ObjectId)',
    }),
    tags: zod_1.z.array(zod_1.z.string().min(1)).optional(),
    isFeatured: booleanFromString.optional().default(false),
    isPublished: booleanFromString.optional().default(false),
});
// CREATE schema: all required (except optional ones)
exports.createProductSchema = zod_1.z.object({
    body: productBodySchema,
});
// UPDATE schema: all fields inside `body` are optional
exports.updateProductSchema = zod_1.z.object({
    body: productBodySchema.partial().extend({
        tags: zod_1.z
            .preprocess(normalizeArray_1.parseToArray, zod_1.z.array(zod_1.z.string().min(1)))
            .optional(),
        removedImages: zod_1.z
            .preprocess(normalizeArray_1.parseToArray, zod_1.z.array(zod_1.z.string().min(1)))
            .optional(),
    }),
});
