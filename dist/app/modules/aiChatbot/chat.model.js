"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// 2. Chat Sub-document Schema
const ChatSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ["user", "bot"],
        required: true
    },
    body: {
        type: String,
        required: true
    },
    intent: {
        type: String,
        required: true,
        enum: ['PRODUCT_DETAILS', 'ORDER_DETAILS', 'GENERAL_QA']
    }
});
// 3. Main Inbox Schema
const InboxSchema = new mongoose_1.Schema({
    userEmail: {
        type: String,
        required: true,
        unique: true
    },
    chat: [ChatSchema]
}, {
    timestamps: true
});
// 4. Create Model
const Inbox = (0, mongoose_1.model)('Inbox', InboxSchema);
exports.default = Inbox;
