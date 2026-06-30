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
exports.generalQuestion = exports.orderAssistent = exports.productDetailsAssistent = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../../errors/AppError"));
const brand_service_1 = require("../../brand/brand.service");
const category_service_1 = require("../../category/category.service");
const chat_utils_1 = require("../chat.utils");
const product_service_1 = require("../../product/product.service");
const groq_1 = require("../../../config/groq");
const config_1 = __importDefault(require("../../../config"));
const order_model_1 = require("../../order/order.model");
const order_service_1 = require("../../order/order.service");
// productDeatils intent service
const productDetailsAssistent = (prompt) => __awaiter(void 0, void 0, void 0, function* () {
    if (!prompt) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'prompt not found');
    }
    // context spliter
    const userPrompts = yield groq_1.groq.chat.completions.create({
        model: groq_1.groqAiModel,
        messages: [
            {
                role: 'system',
                content: `
You are a query context splitter.

Task:
- Split the user message into separate product search contexts.
- If multiple products are mentioned with words like "and", "or", split them into independent contexts.
- Correct obvious spelling mistakes and typing errors before splitting.
- Normalize product names when possible.
- Keep the original meaning unchanged.
- Return ONLY JSON.
- Do not add explanations, markdown, or extra text.

Format:
{
 "contexts":[]
}

Example:

Input:
"I need chicken breast and Radhuni brand oil"

Output:
{
 "contexts":[
   "chicken breast",
   "Radhuni brand oil"
 ]
}

User Message:
"${prompt}"
`,
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
        temperature: 0,
        max_tokens: 300,
    });
    const context = JSON.parse(userPrompts.choices[0].message.content).contexts;
    // Brand finding
    const brands = yield (0, brand_service_1.getAllBrandFromDBService)({});
    // Category finding
    const categories = yield (0, category_service_1.getAllCategoryFromDBService)({});
    // context maping
    const queries = context.map((ctx) => {
        const queryOptions = {};
        queryOptions.brand = (0, chat_utils_1.extractIds)(ctx, brands.data);
        queryOptions.category = (0, chat_utils_1.extractIds)(ctx, categories.data);
        // Price extraction regex
        const priceText = ctx.toLowerCase();
        let minPrice = 0;
        let maxPrice = 100000;
        // under, below, less than 20000
        const maxMatch = priceText.match(/(under|below|less than|<=)\s*(\d+)(k|thousand)?/);
        if (maxMatch) {
            maxPrice = Number(maxMatch[2]) * (maxMatch[3] ? 1000 : 1);
        }
        // above, more than, greater than 50000
        const minMatch = priceText.match(/(above|more than|greater than|>=)\s*(\d+)(k|thousand)?/);
        if (minMatch) {
            minPrice = Number(minMatch[2]) * (minMatch[3] ? 1000 : 1);
        }
        // range: 1000 to 5000
        const rangeMatch = priceText.match(/(\d+)(k|thousand)?\s*(to|-)\s*(\d+)(k|thousand)?/);
        if (rangeMatch) {
            minPrice = Number(rangeMatch[1]) * (rangeMatch[2] ? 1000 : 1);
            maxPrice = Number(rangeMatch[4]) * (rangeMatch[5] ? 1000 : 1);
        }
        queryOptions.minPrice = minPrice;
        queryOptions.maxPrice = maxPrice;
        // getSearch Terms
        const brandIDs = queryOptions.brand.split(',');
        const categroyIDs = queryOptions.category.split(',');
        const brandNames = brands.data
            .filter((b) => brandIDs.includes(b._id.toString()))
            .map((b) => b.name);
        const categoryNames = categories.data
            .filter((c) => categroyIDs.includes(c._id.toString()))
            .map((c) => c.name);
        const searchTerm = (0, chat_utils_1.extractSearchTerm)(ctx, [
            ...categoryNames,
            ...brandNames,
        ]);
        return {
            searchTerm,
            queryOptions,
        };
    });
    // retrive product form DB
    const queryData = yield Promise.all(queries.map((qr) => __awaiter(void 0, void 0, void 0, function* () {
        const products = yield (0, product_service_1.atlasProductSearchService)(qr.searchTerm, qr.queryOptions);
        return products.data;
    })));
    const querProducts = queryData.flat();
    const productTextData = (0, chat_utils_1.formatProductsForAI)(querProducts);
    const systemPrompt = `
You are an e-commerce assistant.

Rules:
- Answer only from provided product data.
- Return Markdown format.
- Show each product as a product card.
- Do not invent any data.
- If no product found, say unavailable.
- Keep response short Only 5 products.

Product Card Format:

### 🛒 {Product Name}

**Price:** {Price} $
**Category:** {Category}

**Details:**
- {Feature 1}
- {Feature 2}

[View Product Details](${config_1.default.CLIENT_URL}/shop/ID)
---

Products:

${productTextData}

User Query:
${prompt}
`;
    const botResponse = yield groq_1.groq.chat.completions.create({
        model: groq_1.groqAiModel,
        messages: [
            {
                role: 'system',
                content: systemPrompt,
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
        temperature: 0,
    });
    const response = botResponse.choices[0].message.content;
    return {
        intentType: 'PRODUCT_DETAILS',
        botResponse: response,
    };
});
exports.productDetailsAssistent = productDetailsAssistent;
// order intent services
const orderAssistent = (prompt, userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    // check if prompt empty
    if (!prompt) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'User Prompt not found');
    }
    // AI action extraction
    const actionFind = yield groq_1.groq.chat.completions.create({
        model: groq_1.groqAiModel,
        messages: [
            {
                role: 'system',
                content: `You are an order assistant.

Extract user order action.

Available actions:
- TRACK_ORDER
- CANCEL_ORDER
- ORDER_DETAILS
- LIST_ORDER
- Return ONLY JSON.
- Do not add explanations, markdown, or extra text.

Format:
{
 "action":"",
 "orderId":""
}`,
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
        temperature: 0,
    });
    const data = JSON.parse(actionFind.choices[0].message.content || '{}');
    // action route
    let order;
    if (data.orderId) {
        order = yield order_model_1.Order.findOne({
            orderId: data.orderId,
            'shippingInfo.email': userEmail,
        }).populate('items.product');
    }
    else {
        // latest order
        order = yield order_model_1.Order.findOne({
            'shippingInfo.email': userEmail,
        })
            .populate('items.product')
            .sort({
            createdAt: -1,
        });
    }
    if (!order) {
        return {
            intentType: "ORDER_DETAILS",
            botResponse: "I couldn't find your order. Please try again with Order ID",
        };
    }
    // action handle
    switch (data.action) {
        case 'CANCEL_ORDER': {
            const cancelled = yield (0, order_service_1.canceledOrderServices)(order._id.toString());
            return {
                intentType: "ORDER_DETAILS",
                action: data.action,
                botResponse: `Your order ${order.orderId} has been cancelled.`,
                data: cancelled,
            };
        }
        case 'TRACK_ORDER':
            return {
                intentType: "ORDER_DETAILS",
                action: data.action,
                botResponse: `

## Order Status

**Order ID:** ${order.orderId}

**Status:** ${order.status}

**Payment:** ${order.isPaymentComplete ? 'Paid' : 'Pending'}

**Order Canceld:** ${order.isCancel ? 'YES' : 'NO'}

        `,
            };
        case 'LIST_ORDER': {
            const orders = yield order_model_1.Order.find({
                'shippingInfo.email': userEmail,
            }).sort({
                createdAt: -1,
            });
            return {
                intentType: "ORDER_DETAILS",
                action: data.action,
                data: orders,
            };
        }
        default:
            return {
                intentType: "ORDER_DETAILS",
                action: 'ORDER_DETAILS',
                botResponse: `

## Order Details

**Order ID:** ${order.orderId}


Items:${order.items
                    .map((item) => `- ${item.product.name} x ${item.quantity}`)
                    .join('\n')}

Total:${order.total} $


**Status:** ${order.status}

**Payment:** ${order.isPaymentComplete ? 'Paid' : 'Pending'}

**Order Canceld:** ${order.isCancel ? 'YES' : 'NO'}

        `,
            };
    }
});
exports.orderAssistent = orderAssistent;
const generalQuestion = (prompt) => __awaiter(void 0, void 0, void 0, function* () {
    if (!prompt) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'prompt not found');
    }
    const botResponse = yield groq_1.groq.chat.completions.create({
        model: groq_1.groqAiModel,
        messages: [
            {
                role: 'system',
                content: `You are an e-commerce assistant.

Task:
- Answer user questions naturally.
- Help users with general questions about the store.
- Be friendly and concise.
- If the question is unrelated to shopping, answer normally.
- Do not invent store information.
- If you don't know something, say you don't have that information.

Store topics you can help with:
- Products
- Delivery
- Payment
- Return policy
- Order process
- Account
- Shopping guidance

Rules:
- Return answer only.
- Use Markdown format.
- Keep response under 150 words.

User Message:
"${prompt}"
`,
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
        temperature: 0,
    });
    return {
        intentType: "GENERAL_QA",
        botResponse: botResponse.choices[0].message.content || " "
    };
});
exports.generalQuestion = generalQuestion;
