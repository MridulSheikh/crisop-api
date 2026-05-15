"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inbox = void 0;
const mongoose_1 = require("mongoose");
// =========================
// Message Schema
// =========================
const messageSchema = new mongoose_1.Schema({
    content: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        enum: ["text", "products", "product_detail", "category"],
        default: "text",
    },
    analysis: {
        intent: { type: String, default: null },
        category: { type: String, default: null },
        searchQuery: { type: String, default: null },
        summary: { type: String, default: null },
        suggestions: {
            type: [String],
            default: [],
        },
    },
}, {
    timestamps: true, // createdAt + updatedAt
});
// =========================
// Inbox Schema
// =========================
const inboxSchema = new mongoose_1.Schema({
    messages: {
        type: [messageSchema],
        default: [],
    },
}, {
    timestamps: true, // inbox createdAt + updatedAt
});
// =========================
// INDEXES (important for chatbot)
// =========================
inboxSchema.index({ user: 1, updatedAt: -1 });
inboxSchema.index({ "messages.analysis.intent": 1 });
inboxSchema.index({ "messages.analysis.category": 1 });
// =========================
// MODEL EXPORT
// =========================
exports.Inbox = (0, mongoose_1.model)("Inbox", inboxSchema);
