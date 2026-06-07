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
exports.generateRagAnswer = exports.retrieveRagSources = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const config_1 = __importDefault(require("../../config"));
const product_model_1 = __importDefault(require("../product/product.model"));
const category_model_1 = __importDefault(require("../category/category.model"));
const brand_model_1 = __importDefault(require("../brand/brand.model"));
const groq = new groq_sdk_1.default({
    apiKey: config_1.default.GROQ_API_KEY,
});
const STOP_WORDS = new Set([
    'a',
    'an',
    'and',
    'are',
    'as',
    'ask',
    'at',
    'below',
    'buy',
    'for',
    'from',
    'give',
    'how',
    'i',
    'in',
    'is',
    'me',
    'of',
    'on',
    'or',
    'show',
    'the',
    'to',
    'under',
    'what',
    'with',
]);
const STORE_KNOWLEDGE = [
    {
        id: 'store-overview',
        type: 'store_policy',
        title: 'Crisop store overview',
        content: 'Crisop is a grocery ecommerce store for fresh groceries, fish, meat, vegetables, fruits, healthy foods, and daily essentials.',
    },
    {
        id: 'delivery-info',
        type: 'store_policy',
        title: 'Delivery information',
        content: 'Crisop helps customers order groceries online and receive delivery. For exact delivery time, area coverage, and fees, customers should check checkout details or contact support.',
    },
    {
        id: 'payment-info',
        type: 'store_policy',
        title: 'Payment information',
        content: 'Crisop supports online checkout. Available payment options can depend on checkout configuration, including card payments when Stripe is enabled.',
    },
    {
        id: 'shopping-help',
        type: 'store_policy',
        title: 'Shopping help',
        content: 'Customers can ask Crisop AI to search products, browse categories, compare prices, check stock, find healthy groceries, and get product recommendations.',
    },
    {
        id: 'support-info',
        type: 'store_policy',
        title: 'Support information',
        content: 'For order-specific problems, refunds, returns, cancellations, or account issues, customers should contact Crisop support or use the relevant order page.',
    },
];
const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const tokenize = (value) => value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
const scoreDocument = (queryTokens, document) => {
    const searchable = `${document.title} ${document.content}`.toLowerCase();
    return queryTokens.reduce((score, token) => {
        if (searchable.includes(token)) {
            return score + (document.title.toLowerCase().includes(token) ? 3 : 1);
        }
        return score;
    }, 0);
};
const buildProductFilter = (analysis) => {
    var _a, _b;
    const filter = {
        isDeleted: { $ne: true },
        isPublished: { $ne: false },
    };
    if (analysis.category && analysis.category !== 'other') {
        filter.category = analysis.category;
    }
    if (analysis.brand && analysis.brand !== 'other') {
        filter.brand = analysis.brand;
    }
    if (((_a = analysis.budget) === null || _a === void 0 ? void 0 : _a.min) || ((_b = analysis.budget) === null || _b === void 0 ? void 0 : _b.max)) {
        const price = {};
        if (analysis.budget.min) {
            price.$gte = analysis.budget.min;
        }
        if (analysis.budget.max) {
            price.$lte = analysis.budget.max;
        }
        filter.price = price;
    }
    return filter;
};
const retrieveProductSources = (message, analysis) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const searchTerm = ((_a = analysis.searchQuery) === null || _a === void 0 ? void 0 : _a.trim()) || message.trim();
    const filter = buildProductFilter(analysis);
    const regex = new RegExp(escapeRegExp(searchTerm), 'i');
    const products = yield product_model_1.default.find(searchTerm
        ? Object.assign(Object.assign({}, filter), { $or: [{ name: regex }, { description: regex }, { tags: regex }] }) : filter)
        .populate('category', 'name')
        .populate('brand', 'name')
        .populate('stock', 'quantity unit')
        .sort({ isFeatured: -1, createdAt: -1 })
        .limit(30)
        .lean();
    return products.map((product) => {
        var _a, _b, _c, _d;
        const price = product.discountPrice || product.price;
        const stockQuantity = (_b = (_a = product.stock) === null || _a === void 0 ? void 0 : _a.quantity) !== null && _b !== void 0 ? _b : 0;
        const category = ((_c = product.category) === null || _c === void 0 ? void 0 : _c.name) || 'Unknown category';
        const brand = ((_d = product.brand) === null || _d === void 0 ? void 0 : _d.name) || 'Unknown brand';
        const tags = Array.isArray(product.tags) ? product.tags.join(', ') : '';
        return {
            id: String(product._id),
            type: 'product',
            title: product.name,
            content: [
                `Product: ${product.name}`,
                `Category: ${category}`,
                `Brand: ${brand}`,
                `Price: ${price} BDT`,
                `Original price: ${product.price} BDT`,
                product.discountPrice ? `Discount price: ${product.discountPrice} BDT` : '',
                `Stock: ${stockQuantity > 0 ? `${stockQuantity} available` : 'out of stock'}`,
                tags ? `Tags: ${tags}` : '',
                product.description ? `Description: ${product.description}` : '',
            ]
                .filter(Boolean)
                .join('\n'),
            metadata: {
                productId: String(product._id),
                price,
                stockQuantity,
                category,
                brand,
            },
        };
    });
});
const retrieveCatalogSources = () => __awaiter(void 0, void 0, void 0, function* () {
    const [categories, brands] = yield Promise.all([
        category_model_1.default.find({ isDeleted: { $ne: true } }).limit(50).lean(),
        brand_model_1.default.find({ isDeleted: { $ne: true } }).limit(50).lean(),
    ]);
    const categorySources = categories.map((category) => ({
        id: String(category._id),
        type: 'category',
        title: category.name,
        content: `Category: ${category.name}\n${category.description || ''}`,
    }));
    const brandSources = brands.map((brand) => ({
        id: String(brand._id),
        type: 'brand',
        title: brand.name,
        content: `Brand: ${brand.name}`,
    }));
    return [...categorySources, ...brandSources];
});
const retrieveRagSources = (message, analysis) => __awaiter(void 0, void 0, void 0, function* () {
    const queryTokens = tokenize(`${message} ${analysis.searchQuery || ''}`);
    const [productSources, catalogSources] = yield Promise.all([
        retrieveProductSources(message, analysis),
        retrieveCatalogSources(),
    ]);
    const allSources = [
        ...productSources,
        ...catalogSources,
        ...STORE_KNOWLEDGE,
    ];
    return allSources
        .map((source) => (Object.assign(Object.assign({}, source), { score: scoreDocument(queryTokens, source) })))
        .filter((source) => source.score > 0 || source.type === 'product')
        .sort((a, b) => b.score - a.score)
        .slice(0, 8);
});
exports.retrieveRagSources = retrieveRagSources;
const buildContext = (sources) => sources
    .map((source, index) => `[${index + 1}] ${source.type.toUpperCase()}: ${source.title}\n${source.content}`)
    .join('\n\n');
const generateRagAnswer = (message, analysis, sources, history) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    if (!sources.length) {
        return {
            answer: "I could not find enough Crisop catalog information for that. Try asking about a product, category, delivery, payment, or healthy grocery suggestion.",
            sources: [],
            suggestions: ['Fresh fish', 'Vegetables', 'Delivery info'],
        };
    }
    const res = yield groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
            {
                role: 'system',
                content: `You are Crisop AI, a helpful grocery ecommerce assistant.

Answer only from the provided RAG context. If the context is insufficient, say what is missing and suggest a useful next question.
Keep answers concise, friendly, and practical.
Use BDT for prices.
Do not invent stock, delivery time, refund policy, discounts, product IDs, or payment methods.

Return strict JSON only:
{
  "answer": "customer-facing answer",
  "suggestions": ["2-5 word suggestion"]
}`,
            },
            {
                role: 'user',
                content: `Conversation history:
${history.map((item) => `${item.role}: ${item.content}`).join('\n') || 'No previous messages'}

Intent analysis:
${JSON.stringify(analysis)}

RAG context:
${buildContext(sources)}

Customer question:
${message}`,
            },
        ],
        temperature: 0.25,
        response_format: {
            type: 'json_object',
        },
    });
    try {
        const parsed = JSON.parse(((_b = (_a = res.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '{}');
        return {
            answer: typeof parsed.answer === 'string' && parsed.answer.trim()
                ? parsed.answer.trim()
                : 'I found relevant Crisop information, but could not format the answer clearly.',
            sources,
            suggestions: Array.isArray(parsed.suggestions)
                ? parsed.suggestions.filter((item) => typeof item === 'string').slice(0, 5)
                : [],
        };
    }
    catch (_c) {
        return {
            answer: 'I found relevant Crisop information, but could not format the answer clearly.',
            sources,
            suggestions: analysis.suggestions || [],
        };
    }
});
exports.generateRagAnswer = generateRagAnswer;
