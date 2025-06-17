import { z } from "zod";

const createCategoryValidationSchema = z.object({
    body: z.object({
        name: z.string(),
        description: z.string().optional(),
    })
})

const updateCategoryValidationSchema = z.object({
    body: z.object({
        name: z.string().optional(),
        description: z.string().optional()
    })
})

export default {
    createCategoryValidationSchema,
    updateCategoryValidationSchema
}