"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeSearchQuery = void 0;
const normalizeSearchQuery = (query) => {
    return query
        .toLowerCase()
        .replace(/\b(price|prices|cost|buy|show|give|need|want|available|details|find|how much|online)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim();
};
exports.normalizeSearchQuery = normalizeSearchQuery;
