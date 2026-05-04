"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Order = void 0;
const mongoose_1 = require("mongoose");
// Define the schema
const orderItemSchema = new mongoose_1.Schema({
    product: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
}, { _id: false });
const orderSchema = new mongoose_1.Schema({
    orderId: { type: String, required: true, unique: true },
    customer: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    shippingInfo: {
        addressOneLine: { type: String, required: true },
        type: {
            type: String,
            enum: ['Standard', '24h', '3d'],
            default: 'Standard',
        },
        contact: { type: String, required: true },
        division: { type: String, required: true },
        email: { type: String, required: true }
    },
    items: { type: [orderItemSchema], required: true },
    status: {
        type: String,
        enum: ['pending', 'packing', 'shipped', 'delivered'],
        default: 'pending',
    },
    isCancel: { type: Boolean, default: false },
    isCod: { type: Boolean, default: false },
    isPaymentComplete: { type: Boolean, default: false },
    total: {
        type: Number,
        required: true
    }
}, { timestamps: true });
// Create the model
exports.Order = (0, mongoose_1.model)('Order', orderSchema);
