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
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const user_service_1 = __importDefault(require("./user.service"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const authCookies_1 = require("../../utils/authCookies");
const createUserIntoDatabseController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    yield user_service_1.default.createUserIntoDatabaseService(data);
    (0, sendResponse_1.default)(res, {
        success: true,
        message: 'Successfully Create user',
        data: null,
        statusCode: http_status_1.default.OK,
    });
}));
const loginUserController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const { accessToken, refreshToken } = yield user_service_1.default.loginUserService(data);
    (0, authCookies_1.setAuthCookies)(res, { accessToken, refreshToken });
    (0, sendResponse_1.default)(res, {
        success: true,
        message: 'Successfully logged in user',
        data: {
            accessToken,
        },
        statusCode: http_status_1.default.OK,
    });
}));
const getSingleUserFromDBController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_service_1.default.getSingleUserFromDBService(req.params.email, req.user.role, req.user.email);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        message: 'successfully retreved user',
        data: result,
        success: true,
    });
}));
const refreshTokenController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.cookies;
    const result = yield user_service_1.default.refreshTokenService(refreshToken);
    (0, authCookies_1.setAuthCookies)(res, {
        accessToken: result.accessToken,
    });
    (0, sendResponse_1.default)(res, {
        success: true,
        message: 'Successfully token refreshed',
        data: result,
        statusCode: http_status_1.default.OK,
    });
}));
const forgetPasswordController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const result = yield user_service_1.default.forgotPassowrdService(email);
    (0, sendResponse_1.default)(res, {
        success: true,
        message: 'We are send reset password link, please check your email',
        data: result,
        statusCode: http_status_1.default.OK,
    });
}));
const resetPasswordContorller = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { password, token } = req.body;
    yield user_service_1.default.resetPasswordServices(token, password);
    (0, sendResponse_1.default)(res, {
        success: true,
        message: 'Successfully reset password',
        data: null,
        statusCode: http_status_1.default.OK,
    });
}));
const handleOAuthController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { accessToken: token, method } = req.body;
    const { accessToken, refreshToken } = yield user_service_1.default.handleOAuthService(token, method);
    (0, authCookies_1.setAuthCookies)(res, { accessToken, refreshToken });
    (0, sendResponse_1.default)(res, {
        success: true,
        message: 'Successfully logged in account',
        data: {
            accessToken,
        },
        statusCode: http_status_1.default.OK,
    });
}));
// create verification code service
const createVerificationCodeController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield user_service_1.default.createVerificationCodeService(req.params.email);
    (0, sendResponse_1.default)(res, {
        success: true,
        message: 'successfully create code',
        data: null,
        statusCode: http_status_1.default.OK,
    });
}));
// verify code
const verfiyCodeController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, code } = req.body;
    const result = yield user_service_1.default.verifyEmailSerivce(email, code);
    const { accessToken, refreshToken } = result;
    (0, authCookies_1.setAuthCookies)(res, { accessToken, refreshToken });
    (0, sendResponse_1.default)(res, {
        success: true,
        message: 'user successfully verified',
        data: result,
        statusCode: http_status_1.default.OK,
    });
}));
// change user role controller
const changeUserRoleController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, role } = req.body;
    const result = yield user_service_1.default.changeUserRoleServices(email, role);
    (0, sendResponse_1.default)(res, {
        success: true,
        message: 'user role successfully changed',
        data: result,
        statusCode: http_status_1.default.OK,
    });
}));
// add team member
const addTeamMemberController = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, role } = req.body;
    const result = yield user_service_1.default.AddTeamMemberServices(email, role);
    (0, sendResponse_1.default)(res, {
        success: true,
        message: 'Team member hasbeen added',
        data: result,
        statusCode: http_status_1.default.OK,
    });
}));
const getAllUserFromDB = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = Object.assign({}, req.query);
    const resData = yield user_service_1.default.getAlluserFromDB(query);
    (0, sendResponse_1.default)(res, {
        success: true,
        message: 'Successfully retrieved users',
        data: resData,
        statusCode: http_status_1.default.OK,
    });
}));
const logOutMeController = (0, catchAsync_1.default)((_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    (0, authCookies_1.clearAuthCookies)(res);
    (0, sendResponse_1.default)(res, {
        success: true,
        message: 'Successfully Logout users',
        data: null,
        statusCode: http_status_1.default.OK,
    });
}));
const userController = {
    forgetPasswordController,
    createUserIntoDatabseController,
    loginUserController,
    getSingleUserFromDBController,
    refreshTokenController,
    resetPasswordContorller,
    handleOAuthController,
    createVerificationCodeController,
    verfiyCodeController,
    changeUserRoleController,
    getAllUserFromDB,
    addTeamMemberController,
    logOutMeController,
};
exports.default = userController;
