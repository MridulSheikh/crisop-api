"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CategorySchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});
CategorySchema.virtual("productsCount", {
    ref: "Product",
    localField: "_id",
    foreignField: "category",
    count: true,
});
const Category = (0, mongoose_1.model)("Category", CategorySchema);
exports.default = Category;
