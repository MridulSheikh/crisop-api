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
exports.chatService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const user_model_1 = __importDefault(require("../user/user.model"));
const intentRouter_services_1 = require("./intentRouter/intentRouter.services");
const chat_model_1 = __importDefault(require("./chat.model"));
const chatBotService = (message, email, inboxId) => __awaiter(void 0, void 0, void 0, function* () {
    // chek inbox id
    const inbox = yield chat_model_1.default.findById(inboxId);
    if (!inbox) {
        // check if user exist or not
        const isUserExists = yield user_model_1.default.isUserExsitsByUserEmail(email);
        if (!isUserExists) {
            throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Please provide a valid user email');
        }
    }
    const intent = yield (0, intentRouter_services_1.intentRoutingResponse)(message);
    const result = yield (0, intentRouter_services_1.intentRouter)(intent, message, email);
    return result;
});
exports.chatService = { chatBotService };
