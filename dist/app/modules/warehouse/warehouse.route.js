"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const warehouse_validation_1 = require("./warehouse.validation");
const warehouse_controller_1 = require("./warehouse.controller");
const user_validation_1 = require("../user/user.validation");
const user_interface_1 = require("../user/user.interface");
const Router = (0, express_1.default)();
Router.route("/")
    .post((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.manager, user_interface_1.UserRole.super), (0, validateRequest_1.default)(warehouse_validation_1.createWarehouseValidationSchema), warehouse_controller_1.createWarehouseIntoDbController)
    .get((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.manager, user_interface_1.UserRole.super), warehouse_controller_1.getAllWarehouseFromDbController);
Router.route("/:id")
    .delete((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.manager, user_interface_1.UserRole.super), warehouse_controller_1.deleteWarehouseController)
    .get((0, auth_1.default)("admin", "manager"), warehouse_controller_1.getSingleWareHouseByIdFromDBController)
    .patch((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.manager, user_interface_1.UserRole.super), (0, validateRequest_1.default)(user_validation_1.UpdateUserValidatonSchema), warehouse_controller_1.updateWarehouseIntoDbController);
exports.default = Router;
