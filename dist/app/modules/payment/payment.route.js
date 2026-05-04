"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_interface_1 = require("../user/user.interface");
const payment_controller_1 = require("./payment.controller");
const router = express_1.default.Router();
router.route("/create-stripe-intent").post((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.manager, user_interface_1.UserRole.super, user_interface_1.UserRole.user), payment_controller_1.stripePaymentIntent);
exports.default = router;
