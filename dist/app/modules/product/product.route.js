"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const product_controller_1 = require("./product.controller");
const product_validation_1 = require("./product.validation");
const user_interface_1 = require("../user/user.interface");
const sendImageToCloudinary_1 = require("../../utils/sendImageToCloudinary");
const router = express_1.default.Router();
// Admin/Manager protected routes
router
    .route('/')
    .post((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.super), sendImageToCloudinary_1.upload.array('images', 5), (0, validateRequest_1.default)(product_validation_1.createProductSchema), product_controller_1.createProductController)
    .get(product_controller_1.getAllProductsController);
router.route('/admin')
    .get((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.manager, user_interface_1.UserRole.super), product_controller_1.getAllProductsAdminController);
router
    .route('/:id')
    .get(product_controller_1.getSingleProductController)
    .patch((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.super), sendImageToCloudinary_1.upload.array('newImages', 5), (0, validateRequest_1.default)(product_validation_1.updateProductSchema), product_controller_1.updateProductController)
    .delete((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.super), product_controller_1.deleteProductController);
// Featured status toggle (special endpoint)
router.patch('/:id/featured', (0, auth_1.default)('admin', 'manager'), product_controller_1.toggleFeaturedController);
exports.default = router;
