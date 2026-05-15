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
// ======================================================
// PRODUCT SEARCH
// ======================================================
const handleProductSearchByChatBot = (analysis) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const categoryId = yield (0, category_service_1.getCategoryIdByNameServices)(analysis.category);
    const baseFilter = {
        name: {
            $regex: analysis.searchQuery,
            $options: "i",
        },
    };
    // category filter
    if (categoryId) {
        baseFilter.category = categoryId;
    }
    // budget filter
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
        .search(["name", "description", "tags"])
        .filter()
        .fields()
        .sort();
    const products = yield productQuery.modelQuery;
    // no products
    if (!products.length) {
        return {
            type: "text",
            message: `Sorry 😔 I couldn't find any products for "${analysis.searchQuery}". Try searching with different keywords.`,
            products: [],
        };
    }
    // build response message
    const message = `
I found ${products.length} ${analysis.category || ""} product${products.length > 1 ? "s" : ""} for you 🛒

${((_e = analysis.budget) === null || _e === void 0 ? void 0 : _e.max)
        ? `Showing products within your budget of ${analysis.budget.max} BDT.\n`
        : ""}

Here are some recommended options based on your search.
`;
    return {
        type: "products",
        message,
        products,
    };
});
exports.handleProductSearchByChatBot = handleProductSearchByChatBot;
// ======================================================
// PRODUCT DETAILS
// ======================================================
const getProductDetailsByChatBot = (analysis) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const product = yield product_model_1.default.findOne({
        name: {
            $regex: analysis.searchQuery,
            $options: "i",
        },
    })
        .populate("category", "name")
        .populate("stock", "quantity warehouse unit");
    // not found
    if (!product) {
        return {
            type: "text",
            message: `Sorry 😔 I couldn't find any product named "${analysis.searchQuery}".`,
        };
    }
    const stock = ((_a = product === null || product === void 0 ? void 0 : product.stock) === null || _a === void 0 ? void 0 : _a.quantity) || 0;
    const category = ((_b = product === null || product === void 0 ? void 0 : product.category) === null || _b === void 0 ? void 0 : _b.name) ||
        "Unknown";
    const stockText = stock > 0
        ? `✅ In Stock (${stock} available)`
        : "❌ Out of Stock";
    return {
        type: "product_detail",
        message: `
🐟 ${product.name}

💰 Price: ${product.price} BDT
📂 Category: ${category}
📦 ${stockText}

${analysis.recommendationHint ||
            "This product is available in our store."}
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
