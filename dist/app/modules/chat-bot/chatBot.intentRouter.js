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
exports.intentRouter = exports.handleGeneralResponse = void 0;
const chatBot_handlers_1 = require("./chatBot.handlers");
const intentHandlers = {
    product_search: chatBot_handlers_1.handleProductSearchByChatBot,
    category_browse: chatBot_handlers_1.handleCategoryBrowseByChatBot,
    product_detail: chatBot_handlers_1.getProductDetailsByChatBot
};
const handleGeneralResponse = (analysis) => __awaiter(void 0, void 0, void 0, function* () {
    const intentResponses = {
        greeting: `Hello 👋 Welcome to Crisop! How can I help you today?`,
        goodbye: "Goodbye 👋 Have a great day and enjoy shopping with Crisop!",
        thanks: "You're welcome 😊 Let me know if you need anything else.",
        general_question: "I can help you with grocery products, healthy food suggestions, orders, delivery, and recommendations.",
    };
    return {
        type: "text",
        intent: analysis.intent,
        message: intentResponses[analysis.intent] ||
            "I'm here to help you with your grocery shopping needs.",
    };
});
exports.handleGeneralResponse = handleGeneralResponse;
const intentRouter = (analysis) => __awaiter(void 0, void 0, void 0, function* () {
    const handler = intentHandlers[analysis.intent];
    if (!handler) {
        return (0, exports.handleGeneralResponse)(analysis);
    }
    return handler(analysis);
});
exports.intentRouter = intentRouter;
