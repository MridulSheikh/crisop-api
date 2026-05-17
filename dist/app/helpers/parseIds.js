"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseIds = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const parseIds = (value) => {
    if (!value || typeof value !== 'string')
        return [];
    return value
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean)
        .map((id) => new mongoose_1.default.Types.ObjectId(id));
};
exports.parseIds = parseIds;
