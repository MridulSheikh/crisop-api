"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const sendImageToCloudinary_1 = require("../../utils/sendImageToCloudinary");
const user_interface_1 = require("../user/user.interface");
const brand_controller_1 = require("./brand.controller");
const brand_validation_1 = __importDefault(require("./brand.validation"));
const router = express_1.default.Router();
router
    .route('/')
    .post((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.manager, user_interface_1.UserRole.super), sendImageToCloudinary_1.upload.single('img'), (0, validateRequest_1.default)(brand_validation_1.default.createBrandValidationSchema), brand_controller_1.createBrandIntoDBController)
    .get(brand_controller_1.getAllBrandFromDBController);
router.delete('/:id/hard', (0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.super), brand_controller_1.hardDeleteBrandFromDBController);
router
    .route('/:id')
    .get(brand_controller_1.getSingleBrandFromDBController)
    .patch((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.manager, user_interface_1.UserRole.super), sendImageToCloudinary_1.upload.single('img'), (0, validateRequest_1.default)(brand_validation_1.default.updateBrandValidationSchema), brand_controller_1.updateBrandIntoDBController)
    .delete((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.manager, user_interface_1.UserRole.super), brand_controller_1.softDeleteBrandFromDBController);
exports.default = router;
