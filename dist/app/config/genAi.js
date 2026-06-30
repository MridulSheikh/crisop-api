"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.model = exports.ai = void 0;
const genai_1 = require("@google/genai");
const _1 = __importDefault(require("."));
exports.ai = new genai_1.GoogleGenAI({ apiKey: _1.default.GEMINI_API_KEY });
exports.model = 'gemini-2.5-flash';
