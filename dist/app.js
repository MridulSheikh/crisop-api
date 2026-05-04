"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = __importDefault(require("./app/routes"));
const globalErrorHandlers_1 = __importDefault(require("./app/middlewares/globalErrorHandlers"));
const notfoundError_1 = __importDefault(require("./app/middlewares/notfoundError"));
const config_1 = __importDefault(require("./app/config"));
const app = (0, express_1.default)();
// Dynamically determine client URL
const client_url = config_1.default.CLIENT_URL;
// Middleware: JSON and cookie parser
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Enable CORS with credentials
app.use((0, cors_1.default)({
    origin: [client_url],
    credentials: true,
}));
// API routes
app.use('/api/v1', routes_1.default);
// Global error handler
app.use(globalErrorHandlers_1.default);
// Not found (404) middleware
app.use(notfoundError_1.default);
exports.default = app;
