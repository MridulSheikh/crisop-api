"use strict";
// src/app/modules/warehouse/warehouse.model.ts
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const warehouseSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    capacity: {
        type: Number,
        default: 0
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
});
const Warehouse = (0, mongoose_1.model)('Warehouse', warehouseSchema);
exports.default = Warehouse;
