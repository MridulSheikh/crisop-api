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
exports.stripePaymentServices = void 0;
const stripe_1 = __importDefault(require("stripe"));
const config_1 = __importDefault(require("../../config"));
const stripe = new stripe_1.default(config_1.default.STRIPE_SECTRET_KEY);
const stripePaymentServices = (_a) => __awaiter(void 0, [_a], void 0, function* ({ items, userEmail, }) {
    const amount = items.reduce((total, item) => total + item.price * item.quantity, 0);
    const paymentIntent = yield stripe.paymentIntents.create({
        amount: amount * 100,
        currency: 'usd',
        receipt_email: userEmail,
        automatic_payment_methods: {
            enabled: true,
        },
        metadata: {
            items: JSON.stringify(items),
            total: amount.toString(),
        },
    });
    return {
        clientSecret: paymentIntent.client_secret,
    };
});
exports.stripePaymentServices = stripePaymentServices;
