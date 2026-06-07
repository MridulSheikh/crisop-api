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
exports.chatService = void 0;
const chatBot_model_1 = require("./chatBot.model");
const groqResponseChatbot_1 = require("../../utils/groqResponseChatbot");
const normalizeSearchQuery_1 = require("../../utils/normalizeSearchQuery");
const chatBot_intentRouter_1 = require("./chatBot.intentRouter");
const chatBot_rag_1 = require("./chatBot.rag");
const chatService = (message, inboxId) => __awaiter(void 0, void 0, void 0, function* () {
    let inbox;
    // =========================
    // 1. FIND OR CREATE INBOX
    // =========================
    if (!inboxId) {
        inbox = yield chatBot_model_1.Inbox.create({
            messages: [],
        });
    }
    else {
        inbox = yield chatBot_model_1.Inbox.findById(inboxId);
        if (!inbox) {
            inbox = yield chatBot_model_1.Inbox.create({
                messages: [],
            });
        }
    }
    const recentHistory = inbox.messages
        .slice(-8)
        .map((item, index) => ({
        role: index % 2 === 0 ? 'user' : 'assistant',
        content: item.content,
    }))
        .filter((item) => Boolean(item.content));
    // =========================
    // 2. AI ANALYSIS + RAG
    // =========================
    const analysis = yield (0, groqResponseChatbot_1.groqResponseChatBot)(message);
    analysis.searchQuery = (0, normalizeSearchQuery_1.normalizeSearchQuery)(analysis.searchQuery);
    const [intentResult, ragSources] = yield Promise.all([
        (0, chatBot_intentRouter_1.intentRouter)(analysis),
        (0, chatBot_rag_1.retrieveRagSources)(message, analysis),
    ]);
    const ragAnswer = yield (0, chatBot_rag_1.generateRagAnswer)(message, analysis, ragSources, recentHistory);
    const result = Object.assign(Object.assign({}, intentResult), { message: ragAnswer.answer || intentResult.message, rag: {
            sources: ragAnswer.sources,
        } });
    if (ragAnswer.suggestions.length) {
        analysis.suggestions = ragAnswer.suggestions;
    }
    // =========================
    // 3. PUSH USER MESSAGE
    // =========================
    inbox.messages.push({
        content: message,
        type: 'text',
        analysis,
    });
    // =========================
    // 4. PUSH ASSISTANT MESSAGE
    // =========================
    inbox.messages.push({
        content: result.message,
        type: 'type' in result ? result.type : 'text',
        analysis: 'analysis' in result ? result.analysis : analysis,
        rag: result.rag,
    });
    // =========================
    // 5. SAVE INBOX
    // =========================
    yield inbox.save();
    // =========================
    // 6. RETURN RESPONSE
    // =========================
    return {
        meta: {
            inboxId: inbox._id,
            analysis,
            rag: {
                sources: ragAnswer.sources,
            },
        },
        data: result,
    };
});
exports.chatService = chatService;
