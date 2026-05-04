"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const stock_validation_1 = require("./stock.validation");
const stock_contorller_1 = require("./stock.contorller");
const user_interface_1 = require("../user/user.interface");
const Router = (0, express_1.default)();
Router.route('/')
    .post((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.manager, user_interface_1.UserRole.super), (0, validateRequest_1.default)(stock_validation_1.createStockValidationSchema), stock_contorller_1.createStockeIntoDbController)
    .get((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.manager, user_interface_1.UserRole.super), stock_contorller_1.getAllStockFromDBController);
Router.route("/:id")
    .get((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.manager, user_interface_1.UserRole.super), stock_contorller_1.getSingleStockFromDBController)
    .delete((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.manager, user_interface_1.UserRole.super), stock_contorller_1.softDeleteController)
    .patch((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.manager, user_interface_1.UserRole.super), (0, validateRequest_1.default)(stock_validation_1.updateStockValidationSchema), stock_contorller_1.updateStockController);
exports.default = Router;
