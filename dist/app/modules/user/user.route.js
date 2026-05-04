"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoute = void 0;
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("./user.controller"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const user_validation_1 = require("./user.validation");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_interface_1 = require("./user.interface");
const Router = express_1.default.Router();
Router.route("/create")
    .post((0, validateRequest_1.default)(user_validation_1.CreateUserValidationSchema), user_controller_1.default.createUserIntoDatabseController);
Router.route("/login")
    .post((0, validateRequest_1.default)(user_validation_1.LoginUserValidationSchema), user_controller_1.default.loginUserController);
Router.route("/refresh-token")
    .post(user_controller_1.default.refreshTokenController);
Router.route("/forgot-password")
    .post((0, validateRequest_1.default)(user_validation_1.forgetPasswordValidationSchema), user_controller_1.default.forgetPasswordController);
Router.route("/reset-password")
    .post((0, validateRequest_1.default)(user_validation_1.resetPasswordValidationSchema), user_controller_1.default.resetPasswordContorller);
Router.route("/oauth")
    .post((0, validateRequest_1.default)(user_validation_1.oAuthValidationSchema), user_controller_1.default.handleOAuthController);
Router.route("/change-role")
    .post((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.super), user_controller_1.default.changeUserRoleController);
Router.route("/add-member")
    .post((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.super), user_controller_1.default.addTeamMemberController);
Router.route("/logout-me").post(user_controller_1.default.logOutMeController);
// Router.route("/email-verification/:email")
// .post(userController.createVerificationCodeController)
Router.route('/verify').post(user_controller_1.default.verfiyCodeController);
Router.route("/")
    .get((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.super), user_controller_1.default.getAllUserFromDB);
Router.route("/:email")
    .get((0, auth_1.default)(user_interface_1.UserRole.admin, user_interface_1.UserRole.user, user_interface_1.UserRole.manager), user_controller_1.default.getSingleUserFromDBController);
exports.UserRoute = Router;
