"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWarehouseValidationSchema = exports.createWarehouseValidationSchema = void 0;
const zod_1 = require("zod");
const createWarehouseValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string(),
        location: zod_1.z.string(),
        capacity: zod_1.z.number()
    })
});
exports.createWarehouseValidationSchema = createWarehouseValidationSchema;
const updateWarehouseValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        location: zod_1.z.string().optional(),
        capacity: zod_1.z.number().optional()
    })
});
exports.updateWarehouseValidationSchema = updateWarehouseValidationSchema;
