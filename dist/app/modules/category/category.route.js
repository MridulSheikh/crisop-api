"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const category_validation_1 = __importDefault(require("./category.validation"));
const category_contorller_1 = require("./category.contorller");
const user_interface_1 = require("../user/user.interface");
const router = express_1.default.Router();
router.route("/")
    .post((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.manager, user_interface_1.UserRole.super), (0, validateRequest_1.default)(category_validation_1.default.createCategoryValidationSchema), category_contorller_1.createCategoryIntoDatabseController)
    .get(category_contorller_1.getAllCategoriesFromDBController);
router.route("/:id")
    .patch((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.manager, user_interface_1.UserRole.super), (0, validateRequest_1.default)(category_validation_1.default.updateCategoryValidationSchema), category_contorller_1.updateOneCateogryIntoDBController)
    .delete((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.manager, user_interface_1.UserRole.super), category_contorller_1.deleteOneCategoryController)
    .get((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.manager, user_interface_1.UserRole.super), category_contorller_1.getSingleCategoryFromDbController);
exports.default = router;
