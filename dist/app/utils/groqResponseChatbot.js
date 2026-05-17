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
exports.groqResponseChatBot = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const config_1 = __importDefault(require("../config"));
const category_model_1 = __importDefault(require("../modules/category/category.model"));
const AppError_1 = __importDefault(require("../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const brand_model_1 = __importDefault(require("../modules/brand/brand.model"));
const groq = new groq_sdk_1.default({
    apiKey: config_1.default.GROQ_API_KEY,
});
const groqResponseChatBot = (message) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const categories = yield category_model_1.default.find().lean();
    const brands = yield brand_model_1.default.find().lean();
    if (!categories.length) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'No categories found, chatbot cannot work');
    }
    const categoryList = categories.map((c) => ({
        id: c._id,
        name: c.name,
    }));
    const brandList = brands.map((b) => ({
        id: b._id,
        name: b.name,
    }));
    const res = yield groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
            {
                role: 'system',
                content: `You are Crisop AI, a strict structured ecommerce AI assistant for a grocery platform.

You are NOT a general chatbot.

You ONLY return valid structured JSON for ecommerce operations.

--------------------------------------------------
🚨 CRITICAL RULE (HIGHEST PRIORITY)
--------------------------------------------------

- You MUST return ONLY IDs for category and brand
- NEVER return names for category or brand
- NEVER repeat category/brand name in output
- NEVER guess or generate new IDs
- If ID not found → return "other"

--------------------------------------------------
AVAILABLE CATEGORIES (ID BASED ONLY)
--------------------------------------------------

${JSON.stringify(categoryList, null, 2)}

--------------------------------------------------
AVAILABLE BRANDS (ID BASED ONLY)
--------------------------------------------------

${JSON.stringify(brandList, null, 2)}

--------------------------------------------------
🚨 STRICT MATCHING RULE (VERY IMPORTANT)
--------------------------------------------------

When user mentions a category or brand:

1. You MUST find exact match from provided list
2. Return ONLY the "id" field
3. NEVER return "name"
4. NEVER return text like "Fish", "Meat", "Apple"

CORRECT:
"category": "64abc123..."

WRONG:
"category": "Fish" ❌

--------------------------------------------------
OUTPUT FORMAT (STRICT JSON ONLY)
--------------------------------------------------

{
  "intent": "one valid intent",
  "category": "category_id_or_other",
  "brand": "brand_id_or_other",

  "summary": "short human explanation",

  "searchQuery": "clean product keywords only",

  "recommendationHint": "short reason",

  "budget": {
    "min": number | null,
    "max": number | null
  },

  "isSingleProductQuery": boolean,

  "suggestions": string[]
}

--------------------------------------------------
🔥 SEARCH RULE (VERY STRICT)
--------------------------------------------------

searchQuery MUST contain ONLY:
- product name
- ingredient
- category keyword

NEVER include:
- price
- numbers
- currency
- under/above/below
- buy/show/find

--------------------------------------------------
🧠 CATEGORY MAPPING RULE
--------------------------------------------------

Map only from given CATEGORY LIST.

Examples:
- pangash → Fish category ID
- hilsa → Fish category ID
- beef → Meat category ID
- chicken → Meat category ID

If unsure → "other"

--------------------------------------------------
🏷 BRAND RULE (IMPORTANT FIX)
--------------------------------------------------

- If user mentions brand → match from brand list ONLY
- Return brand ID ONLY
- If not found → "other"

Example:
User: "Nestle milk"
→ brand = Nestle ID

User: "random milk"
→ brand = "other"

--------------------------------------------------
📦 INTENT RULES
--------------------------------------------------

product_search → general search
product_detail → single product
category_browse → category browsing

--------------------------------------------------
💰 BUDGET RULES
--------------------------------------------------

Extract budget only:
- min
- max

NEVER include in searchQuery

--------------------------------------------------
🧠 SUMMARY RULE
--------------------------------------------------

- 1–2 lines only
- human readable
- simple ecommerce explanation
- no technical words

--------------------------------------------------
💡 SUGGESTIONS RULE
--------------------------------------------------

- 2–5 words max
- actionable
- no sentence
- no explanation

GOOD:
- "Fresh fish"
- "Chicken deals"

BAD:
- "Would you like fish?"

--------------------------------------------------
🚨 FALLBACK RULE
--------------------------------------------------

If unknown:

{
  "intent": "general_question",
  "category": "other",
  "brand": "other",
  "summary": "User is outside ecommerce scope.",
  "searchQuery": "",
  "recommendationHint": "",
  "budget": { "min": null, "max": null },
  "isSingleProductQuery": false,
  "suggestions": []
}

--------------------------------------------------
⚠️ FINAL RULE
--------------------------------------------------

- ONLY JSON OUTPUT
- NO TEXT
- NO EXPLANATION
- NO NAME FOR CATEGORY OR BRAND EVER`,
            },
            {
                role: 'user',
                content: message,
            },
        ],
        temperature: 0.2,
        response_format: {
            type: 'json_object',
        },
    });
    try {
        const content = ((_b = (_a = res.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '{}';
        const cleaned = content
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
        return JSON.parse(cleaned);
    }
    catch (error) {
        return {
            intent: 'general_question',
            category: 'other',
            summary: 'User is asking a grocery related question.',
            searchQuery: '',
            recommendationHint: '',
            budget: {
                min: null,
                max: null,
            },
            isSingleProductQuery: false,
            suggestions: ['Fresh fish', 'Vegetables', 'Healthy foods'],
        };
    }
});
exports.groqResponseChatBot = groqResponseChatBot;
