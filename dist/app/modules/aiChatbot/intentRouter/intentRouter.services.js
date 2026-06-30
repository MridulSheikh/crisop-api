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
Object.defineProperty(exports, "__esModule", { value: true });
exports.intentRoutingResponse = exports.intentRouter = void 0;
const intent_assistent_1 = require("./intent.assistent");
const groq_1 = require("../../../config/groq");
const intentRouter = (intent, userPrompt, userEmail) => __awaiter(void 0, void 0, void 0, function* () {
    switch (intent) {
        case 'PRODUCT_DETAILS':
            return (0, intent_assistent_1.productDetailsAssistent)(userPrompt);
        case 'ORDER_DETAILS':
            return (0, intent_assistent_1.orderAssistent)(userPrompt, userEmail);
        case 'GENERAL_QA':
            return (0, intent_assistent_1.generalQuestion)(userPrompt);
        default:
            return {
                intentResponse: 'Sorry, I could not understand your request.',
            };
    }
});
exports.intentRouter = intentRouter;
const intentRoutingResponse = (prompt) => __awaiter(void 0, void 0, void 0, function* () {
    const routingResponse = yield groq_1.groq.chat.completions.create({
        model: groq_1.groqAiModel,
        messages: [
            {
                role: 'system',
                content: `
You are an e-commerce intent classifier.

Classify the user message into exactly one:

PRODUCT_DETAILS:
User wants to search, browse, view, discover, list, or get information about products.

Examples:
"show me some fish"
"show me all phones"
"find laptops"
"give me available products"
"product price"


ORDER_DETAILS:
User asks about an existing order.

Examples:
"where is my order"
"track my order"
"cancel my order"


GENERAL_QA:
General questions or non-shopping conversations.

Examples:
"what is fish"
"how does payment work"
"hello"


Return only JSON:

{
 "intent":"PRODUCT_DETAILS"
}
        `,
            },
            {
                role: 'user',
                content: prompt,
            },
        ],
        temperature: 0,
    });
    const result = JSON.parse(routingResponse.choices[0].message.content);
    return result.intent;
});
exports.intentRoutingResponse = intentRoutingResponse;
