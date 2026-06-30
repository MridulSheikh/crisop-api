"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.groqAiModel = exports.groq = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const _1 = __importDefault(require("."));
exports.groq = new groq_sdk_1.default({
    apiKey: _1.default.GROQ_API_KEY
});
exports.groqAiModel = "llama-3.3-70b-versatile";
