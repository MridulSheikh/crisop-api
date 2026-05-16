"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const brandSchema = new mongoose_1.Schema({
    img: {
        url: {
            type: String,
            required: true,
            trim: true,
        },
        public_id: {
            type: String,
            required: true,
            trim: true,
        },
    },
    name: {
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
});
const Brand = (0, mongoose_1.model)('Brand', brandSchema);
exports.default = Brand;
