"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nanoid_1 = require("nanoid");
const stock_model_1 = __importDefault(require("../modules/stock/stock.model"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const DEFAULT_SKU_LENGTH = 6;
const MAX_ATTEMPTS = 10;
const gsku = (productName) => __awaiter(void 0, void 0, void 0, function* () {
    if (!(productName === null || productName === void 0 ? void 0 : productName.trim())) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Product name must be at least 1 character');
    }
    // Clean and get base
    const cleanedName = productName.replace(/\s+/g, '');
    const base = cleanedName.slice(0, 3).toUpperCase();
    // Generate unique SKU
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        const randomId = (0, nanoid_1.nanoid)(DEFAULT_SKU_LENGTH).toUpperCase();
        const sku = `${base}-${randomId}`;
        const existing = yield stock_model_1.default.findOne({ sku });
        if (!existing) {
            return sku; // This is now properly using the sku declared in this block
        }
    }
    throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Failed to generate unique SKU after multiple attempts');
});
exports.default = gsku;
