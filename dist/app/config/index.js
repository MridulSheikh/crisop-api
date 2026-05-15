"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(process.cwd(), '.env') });
exports.default = {
    NODE_ENV: process.env.NODE_ENV,
    port: process.env.PORT,
    database_url: process.env.DATABASE_URL,
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_EMAIL: process.env.SMTP_EMAIL,
    SMTP_PASS: process.env.SMTP_PASS,
    SMTP_SERVICE: process.env.SMTP_SERVICE,
    BCRYPT_SALT: process.env.SALT_ROUNDS,
    JWT_ACCESS_SECRET: process.env.JWT_SECRET,
    JWT_ACCESS_EXPIRES_ID: process.env.JWT_EXPIREIN,
    CLIENT_URL: process.env.CLIENT_URL,
    REFRESH_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET,
    REFRESH_EXPIREIN: process.env.JWT_REFRESH_EXPIREIN,
    JWT_RESETPASSWORD_TOKEN_SECRET: process.env.JWT_RESETPASSWORD_TOKEN_SECRET,
    JWT_RESETPASSWORD_TOKEN_EXPIREIN: process.env.JWT_RESETPASSWORD_TOKEN_EXPIREIN,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    STRIPE_SECTRET_KEY: process.env.STRIPE_SECRET_KEY,
    RESEND_API: process.env.RESEND_API_KEY,
    GROQ_API_KEY: process.env.GROQ_API_KEY
};
