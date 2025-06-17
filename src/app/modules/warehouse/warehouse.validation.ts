import { z } from "zod";

const createWarehouseValidationSchema = z.object({
    body: z.object({
        name: z.string(),
        location: z.string(),
        capacity: z.number()
    })
})

const updateWarehouseValidationSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        location: z.string().optional(),
        capacity: z.number().optional()
    })
})

export {
    createWarehouseValidationSchema,
    updateWarehouseValidationSchema
}