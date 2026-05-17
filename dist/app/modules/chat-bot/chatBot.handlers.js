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
exports.handleCategoryBrowseByChatBot = exports.getProductDetailsByChatBot = exports.handleProductSearchByChatBot = void 0;
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
const category_service_1 = require("../category/category.service");
const product_model_1 = __importDefault(require("../product/product.model"));
const product_service_1 = require("../product/product.service");
// ======================================================
// PRODUCT SEARCH
// ======================================================
const handleProductSearchByChatBot = (analysis) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const isCategoryBrowse = analysis.intent === "category_browse";
    const isDetail = analysis.intent === "product_detail";
    // =========================
    // 🧠 PRODUCT DETAIL
    // =========================
    if (isDetail) {
        return Object.assign({ type: "product_detail", message: `Searching product details for "${analysis.searchQuery}"` }, (yield (0, product_service_1.atlasProductSearchService)(analysis.searchQuery, {
            limit: 1,
        })));
    }
    // =========================
    // 🛒 CATEGORY BROWSE
    // =========================
    if (isCategoryBrowse) {
        const result = yield (0, product_service_1.atlasProductSearchService)("", {
            category: analysis.category,
            page: analysis.page,
            limit: 10,
            minPrice: (_a = analysis.budget) === null || _a === void 0 ? void 0 : _a.min,
            maxPrice: (_b = analysis.budget) === null || _b === void 0 ? void 0 : _b.max,
        });
        return Object.assign({ type: "category", message: `Browsing category 🛒` }, result);
    }
    // =========================
    // 🔍 DEFAULT PRODUCT SEARCH
    // =========================
    const result = yield (0, product_service_1.atlasProductSearchService)(analysis.searchQuery, {
        page: analysis.page,
        limit: 10,
        category: analysis.category !== "other"
            ? analysis.category
            : undefined,
        brand: analysis.brand !== "other"
            ? analysis.brand
            : undefined,
        minPrice: (_c = analysis.budget) === null || _c === void 0 ? void 0 : _c.min,
        maxPrice: (_d = analysis.budget) === null || _d === void 0 ? void 0 : _d.max,
    });
    if (!result.data.length) {
        return {
            type: "text",
            message: `Sorry 😔 I couldn't find any products for "${analysis.searchQuery}".`,
            products: [],
        };
    }
    return Object.assign({ type: "products", message: `Found ${result.meta.total} products 🛒` }, result);
});
exports.handleProductSearchByChatBot = handleProductSearchByChatBot;
// ======================================================
// PRODUCT DETAILS
// ======================================================
const getProductDetailsByChatBot = (analysis) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const searchTerm = (_a = analysis.searchQuery) === null || _a === void 0 ? void 0 : _a.trim();
    let product = null;
    // =========================
    // 🔍 ATLAS SEARCH (FAST)
    // =========================
    if (searchTerm) {
        const result = yield product_model_1.default.aggregate([
            {
                $search: {
                    index: "product_search_index",
                    text: {
                        query: searchTerm,
                        path: "name",
                        fuzzy: { maxEdits: 1 },
                    },
                },
            },
            {
                $limit: 1,
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category",
                },
            },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "stocks",
                    localField: "stock",
                    foreignField: "_id",
                    as: "stock",
                },
            },
            { $unwind: { path: "$stock", preserveNullAndEmptyArrays: true } },
        ]);
        product = result[0];
    }
    // =========================
    // ❌ NOT FOUND
    // =========================
    if (!product) {
        return {
            type: "text",
            message: `Sorry 😔 I couldn't find any product named "${searchTerm}".`,
        };
    }
    // =========================
    // 📦 STOCK
    // =========================
    const stock = ((_b = product === null || product === void 0 ? void 0 : product.stock) === null || _b === void 0 ? void 0 : _b.quantity) || 0;
    const category = ((_c = product === null || product === void 0 ? void 0 : product.category) === null || _c === void 0 ? void 0 : _c.name) || "Unknown";
    const stockText = stock > 0
        ? `✅ In Stock (${stock} available)`
        : "❌ Out of Stock";
    // =========================
    // 🚀 RESPONSE
    // =========================
    return {
        type: "product_detail",
        message: `
🐟 ${product.name}

💰 Price: ${product.price} BDT
📂 Category: ${category}
📦 ${stockText}

${analysis.recommendationHint || "This product is available in our store."}
    `,
        products: [product],
    };
});
exports.getProductDetailsByChatBot = getProductDetailsByChatBot;
// ======================================================
// CATEGORY BROWSE
// ======================================================
const handleCategoryBrowseByChatBot = (analysis) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const categoryId = yield (0, category_service_1.getCategoryIdByNameServices)(analysis.category);
    if (!categoryId) {
        return {
            type: "text",
            message: `Sorry 😔 I couldn't find the "${analysis.category}" category.`,
        };
    }
    const baseFilter = {
        category: categoryId,
    };
    // budget
    if (((_a = analysis.budget) === null || _a === void 0 ? void 0 : _a.max) ||
        ((_b = analysis.budget) === null || _b === void 0 ? void 0 : _b.min)) {
        baseFilter.price = {};
        if ((_c = analysis.budget) === null || _c === void 0 ? void 0 : _c.min) {
            baseFilter.price.$gte =
                analysis.budget.min;
        }
        if ((_d = analysis.budget) === null || _d === void 0 ? void 0 : _d.max) {
            baseFilter.price.$lte =
                analysis.budget.max;
        }
    }
    const productQuery = new QueryBuilder_1.default(product_model_1.default.find(baseFilter)
        .populate("stock", "quantity")
        .populate("category", "name"), {})
        .filter()
        .sort()
        .fields();
    const products = yield productQuery.modelQuery;
    if (!products.length) {
        return {
            type: "text",
            message: `No products available in the ${analysis.category} category right now.`,
        };
    }
    return {
        type: "category",
        message: `
Browsing ${analysis.category} category 🛒

Found ${products.length} product${products.length > 1 ? "s" : ""} available in this category.

${((_e = analysis.budget) === null || _e === void 0 ? void 0 : _e.max)
            ? `Showing products under ${analysis.budget.max} BDT.`
            : ""}
      `,
        products,
    };
});
exports.handleCategoryBrowseByChatBot = handleCategoryBrowseByChatBot;
