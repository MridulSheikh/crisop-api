"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const oreder_validation_1 = require("./oreder.validation");
const order_controller_1 = require("./order.controller");
const user_interface_1 = require("../user/user.interface");
const router = express_1.default.Router();
router.route("/").post((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.user, user_interface_1.UserRole.manager, user_interface_1.UserRole.super), (0, validateRequest_1.default)(oreder_validation_1.createOrderSchema), order_controller_1.createOrderController)
    .get((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.manager, user_interface_1.UserRole.super), order_controller_1.getAllOrderFromDBController);
router.route("/my-orders").get((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.user, user_interface_1.UserRole.manager, user_interface_1.UserRole.super), order_controller_1.getMyOrderController);
router.route("/toggle/:id")
    .patch((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.manager, user_interface_1.UserRole.super), (0, validateRequest_1.default)(oreder_validation_1.toggleStatusValidationSchema), order_controller_1.toggleOrderStatusController);
router.route("/:id").get((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.manager, user_interface_1.UserRole.super), order_controller_1.getSingleOrderFromDBController);
router.route("/:id/cancel").patch((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.user, user_interface_1.UserRole.manager, user_interface_1.UserRole.super), order_controller_1.canceledOrderController);
exports.default = router;
