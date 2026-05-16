"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const contact_route_1 = require("../modules/contact/contact.route");
const user_route_1 = require("../modules/user/user.route");
const category_route_1 = __importDefault(require("../modules/category/category.route"));
const warehouse_route_1 = __importDefault(require("../modules/warehouse/warehouse.route"));
const product_route_1 = __importDefault(require("../modules/product/product.route"));
const stock_route_1 = __importDefault(require("../modules/stock/stock.route"));
const order_route_1 = __importDefault(require("../modules/order/order.route"));
const payment_route_1 = __importDefault(require("../modules/payment/payment.route"));
const chatBot_route_1 = __importDefault(require("../modules/chat-bot/chatBot.route"));
const brand_route_1 = __importDefault(require("../modules/brand/brand.route"));
const router = (0, express_1.Router)();
const modulesRutes = [
    {
        path: '/contact',
        route: contact_route_1.ContactRoute,
    },
    {
        path: '/user',
        route: user_route_1.UserRoute
    },
    {
        path: '/category',
        route: category_route_1.default
    },
    {
        path: '/brand',
        route: brand_route_1.default
    },
    {
        path: '/warehouse',
        route: warehouse_route_1.default
    },
    {
        path: "/stock",
        route: stock_route_1.default
    },
    {
        path: "/product",
        route: product_route_1.default
    },
    {
        path: "/order",
        route: order_route_1.default,
    },
    {
        path: '/payment',
        route: payment_route_1.default
    },
    {
        path: '/chatBot',
        route: chatBot_route_1.default
    }
];
modulesRutes.forEach((route) => router.use(route.path, route.route));
exports.default = router;
