"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatProductsForAI = exports.extractSearchTerm = exports.extractIds = void 0;
const string_similarity_1 = __importDefault(require("string-similarity"));
const extractIds = (prompt, list) => {
    const words = prompt.toLowerCase().split(/\s+/);
    return list
        .filter((item) => {
        const brandName = item.name.toLowerCase();
        return words.some((word) => string_similarity_1.default.compareTwoStrings(word, brandName) > 0.7);
    })
        .map((item) => item._id.toString())
        .join(',');
};
exports.extractIds = extractIds;
const extractSearchTerm = (prompt, removeWords) => {
    let text = prompt.toLowerCase();
    // remove brand/category names
    removeWords.forEach((word) => {
        const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        text = text.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), '');
    });
    // remove common phrases
    text = text.replace(/\b(do you have|i need|show me|give me|find me|i want|can you show)\b/gi, '');
    // remove filler words
    text = text.replace(/\b(i|need|some|show|me|want|give|find|available|and|with|the|a|an|for|please|brand)\b/gi, '');
    // remove extra spaces
    text = text.replace(/\s+/g, ' ').trim();
    // remove duplicate words
    const uniqueWords = [...new Set(text.split(' '))];
    return uniqueWords.join(' ');
};
exports.extractSearchTerm = extractSearchTerm;
const formatProductsForAI = (products) => {
    return products
        .map((product, index) => {
        var _a, _b;
        return `
Product ${index + 1}:

ID: ${product._id}

Name: ${product.name}

Category: ${((_a = product.category) === null || _a === void 0 ? void 0 : _a.name) || ""}

Price: ${product.discountPrice} $

Stock: ${product.stock ? "Available" : "Out of stock"}

Tags: ${((_b = product.tags) === null || _b === void 0 ? void 0 : _b.join(", ")) || ""}
`;
    })
        .join("\n-------------------\n");
};
exports.formatProductsForAI = formatProductsForAI;
