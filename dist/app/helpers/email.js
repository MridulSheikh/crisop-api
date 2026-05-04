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
exports.sendEmail = void 0;
const config_1 = __importDefault(require("../config"));
const resend_1 = require("resend");
const AppError_1 = __importDefault(require("../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const resend = new resend_1.Resend(config_1.default.RESEND_API);
const sendEmail = (_to, subject, html) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const data = yield resend.emails.send({
            from: config_1.default.SMTP_EMAIL,
            to: "crisop.freshfood@gmail.com", // this is for testing | can't send email to user with out using real domain
            subject,
            html,
        });
        if ((_a = data.error) === null || _a === void 0 ? void 0 : _a.statusCode) {
            throw new AppError_1.default((_b = data.error) === null || _b === void 0 ? void 0 : _b.statusCode, data.error.message);
        }
        return data;
    }
    catch (error) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Something went wrong!');
    }
});
exports.sendEmail = sendEmail;
exports.default = exports.sendEmail;
