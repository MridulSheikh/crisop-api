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
exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config"));
exports.transporter = nodemailer_1.default.createTransport({
    service: config_1.default.SMTP_SERVICE,
    host: config_1.default.SMTP_HOST,
    port: Number(config_1.default.SMTP_PORT),
    secure: false,
    auth: {
        user: config_1.default.SMTP_EMAIL,
        pass: config_1.default.SMTP_PASS,
    },
});
const sendEmail = (to, subject, body) => __awaiter(void 0, void 0, void 0, function* () {
    const senderInfoData = {
        from: `"Crisop" <${config_1.default.SMTP_EMAIL}>`,
        to: to,
        subject: subject,
        html: body,
    };
    yield exports.transporter.sendMail(senderInfoData);
});
exports.default = sendEmail;
