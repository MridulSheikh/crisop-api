"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const user_model_1 = __importStar(require("./user.model"));
const config_1 = __importDefault(require("../../config"));
const user_utils_1 = require("./user.utils");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const email_1 = __importDefault(require("../../helpers/email"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const fetchGoogleUserInfo_1 = require("../../utils/fetchGoogleUserInfo");
const fechFacebookUserInfo_1 = require("../../utils/fechFacebookUserInfo");
const generateVerificationCode_1 = require("../../utils/generateVerificationCode");
const QueryBuilder_1 = __importDefault(require("../../builder/QueryBuilder"));
// create user into database
const createUserIntoDatabaseService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // is user exists on database
    const isUserExists = yield user_model_1.default.isUserExsitsByUserEmail(payload.email);
    if (isUserExists) {
        throw new AppError_1.default(http_status_1.default.CONFLICT, 'This email already taken');
    }
    const newUser = yield user_model_1.default.create(payload);
    // send verification mail
    yield createVerificationCodeService(newUser.email);
    return newUser;
});
// login user service
const loginUserService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    // is user exists on databse
    const isUserExists = yield user_model_1.default.isUserExsitsByUserEmail(payload.email);
    if (!isUserExists) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Wrong credential input');
    }
    // is password matched
    const isPasswordMatched = yield user_model_1.default.isPasswordMatch(payload.password, isUserExists === null || isUserExists === void 0 ? void 0 : isUserExists.password);
    if (!isPasswordMatched) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Wrong credential input');
    }
    // check is user verified or not
    if (!isUserExists.isVerified) {
        yield createVerificationCodeService(payload.email);
        throw new AppError_1.default(http_status_1.default.FORBIDDEN, 'You are not verified, please check your email!');
    }
    // update user need user login status
    yield user_model_1.default.findOneAndUpdate({ email: payload.email }, { needLogin: false });
    const jwtPayload = {
        _id: isUserExists._id,
        role: isUserExists.role,
        email: isUserExists.email,
        name: isUserExists.name,
    };
    // create token and sent to the client
    const accessToken = (0, user_utils_1.createToken)(jwtPayload, config_1.default.JWT_ACCESS_SECRET, config_1.default.JWT_ACCESS_EXPIRES_ID);
    // create refresh token
    const refreshToken = (0, user_utils_1.createToken)(jwtPayload, config_1.default.REFRESH_SECRET, config_1.default.REFRESH_EXPIREIN);
    // return jwt token
    return {
        accessToken,
        refreshToken,
        role: isUserExists.role,
    };
});
// get single user from db
const getSingleUserFromDBService = (email, role, requestEmail) => __awaiter(void 0, void 0, void 0, function* () {
    // validation for only admin or user can access this data
    const isValidRequest = requestEmail === email ? true : role === 'admin' ? true : false;
    if (!isValidRequest) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'Invalid request');
    }
    const result = yield user_model_1.default.findOne({ email: email });
    // if user not exist in database
    if (!result) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'user not found!');
    }
    return result;
});
// refresh token serivce
const refreshTokenService = (token) => __awaiter(void 0, void 0, void 0, function* () {
    // checking if the give token is valid
    const decoded = jsonwebtoken_1.default.verify(token, config_1.default.REFRESH_SECRET);
    const { email } = decoded;
    // checking if the user is exists
    const user = yield user_model_1.default.isUserExsitsByUserEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'User not found!');
    }
    const jwtPayload = {
        _id: user._id,
        role: user.role,
        email: user.email,
    };
    // create refresh token
    const accessToken = (0, user_utils_1.createToken)(jwtPayload, config_1.default.JWT_ACCESS_SECRET, config_1.default.JWT_ACCESS_EXPIRES_ID);
    return {
        accessToken,
    };
});
// forgot password
const forgotPassowrdService = (email) => __awaiter(void 0, void 0, void 0, function* () {
    // is user exists on databse
    const user = yield user_model_1.default.isUserExsitsByUserEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Invalid request, user not found!');
    }
    const jwtPayload = {
        _id: user._id,
        role: user.role,
        email: user.email,
    };
    // create forgotPassword token
    const forgotPasswordToken = (0, user_utils_1.createToken)(jwtPayload, config_1.default.JWT_RESETPASSWORD_TOKEN_SECRET, config_1.default.JWT_RESETPASSWORD_TOKEN_EXPIREIN);
    // make reset password link
    const resetPasswordLink = `${config_1.default.NODE_ENV === 'development' ? 'http://localhost:3000' : config_1.default.CLIENT_URL}/reset-password?token=${forgotPasswordToken}`;
    const templatePath = path_1.default.join(
    // eslint-disable-next-line no-undef
    __dirname, '../../utils/templates/resetPassword/html.ejs');
    const emailTemplate = yield ejs_1.default.renderFile(templatePath, {
        name: user.name,
        resetLink: resetPasswordLink,
    });
    yield (0, email_1.default)(user.email, 'Action nedded! Reset your password', emailTemplate);
    return null;
});
// Reset password
const resetPasswordServices = (token, password) => __awaiter(void 0, void 0, void 0, function* () {
    if (!token) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'You are not Authorized');
    }
    const decoded = jsonwebtoken_1.default.verify(token, config_1.default.JWT_RESETPASSWORD_TOKEN_SECRET);
    const { email } = decoded;
    const user = yield user_model_1.default.isUserExsitsByUserEmail(email);
    // if user not exist
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Invalid request, user not found!');
    }
    // if resetlink not expire
    const ifLinkExpire = yield user_model_1.ExpireResetPasswordLink.findOne({ token: token });
    if (ifLinkExpire) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Invalid request, link already expire');
    }
    // // hased password
    const hashedPassword = yield bcrypt_1.default.hash(password, 10);
    // Update the user's password in DB
    yield user_model_1.default.findOneAndUpdate({ email }, {
        password: hashedPassword,
    });
    // make jwt expire after one time use
    yield user_model_1.ExpireResetPasswordLink.create({ token });
});
// Oauth login
const handleOAuthService = (token, method) => __awaiter(void 0, void 0, void 0, function* () {
    let oauthUser;
    if (method === 'google') {
        oauthUser = yield (0, fetchGoogleUserInfo_1.fetchGoogleUserInfo)(token);
    }
    if (method === 'facebook') {
        oauthUser = yield (0, fechFacebookUserInfo_1.fetchFacebookUserInfo)(token);
    }
    if (!(oauthUser === null || oauthUser === void 0 ? void 0 : oauthUser.email)) {
        throw new AppError_1.default(http_status_1.default.UNAUTHORIZED, 'There was a problem with this Google account. Please try another.');
    }
    let user = yield user_model_1.default.isUserExsitsByUserEmail(oauthUser.email);
    // if user does not exist database
    if (!user) {
        user = yield user_model_1.default.create({
            name: oauthUser.name,
            email: oauthUser.email,
            image: oauthUser.image,
            isVerified: true,
            authProvider: method,
        });
    }
    if (!user.isVerified) {
        user = yield user_model_1.default.findOneAndUpdate({ email: user.email }, { isVerified: true }, { new: true, upsert: true });
    }
    // update user need user login status
    yield user_model_1.default.findOneAndUpdate({ email: user.email }, { needLogin: false });
    const jwtPayload = {
        _id: user._id,
        role: user.role,
        email: user.email,
        name: user.name,
    };
    // generate jwt token
    const accessToken = (0, user_utils_1.createToken)(jwtPayload, config_1.default.JWT_ACCESS_SECRET, config_1.default.JWT_ACCESS_EXPIRES_ID);
    // create refresh token
    const refreshToken = (0, user_utils_1.createToken)(jwtPayload, config_1.default.REFRESH_SECRET, config_1.default.REFRESH_EXPIREIN);
    return {
        accessToken,
        refreshToken,
    };
});
// create verification code service
const createVerificationCodeService = (email) => __awaiter(void 0, void 0, void 0, function* () {
    // check is user exist
    const user = yield user_model_1.default.isUserExsitsByUserEmail(email);
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'Invalid request, user not found!');
    }
    const code = (0, generateVerificationCode_1.generateVerificationCode)();
    const expireIn = new Date(Date.now() + 3 * 60 * 1000);
    // save and update verification code into DB
    yield user_model_1.UserEmailVerificationCenter.findOneAndUpdate({ email }, {
        email,
        code,
        expireIn,
    }, { upsert: true, new: true });
    // send code via email
    const templatePath = path_1.default.join(
    // eslint-disable-next-line no-undef
    __dirname, '../../utils/templates/varification/email-verification.ejs');
    const emailTemplate = yield ejs_1.default.renderFile(templatePath, {
        name: user.name,
        code: code,
    });
    yield (0, email_1.default)(user.email, 'Action nedded! verify your email address', emailTemplate);
    return null;
});
// verify email service
const verifyEmailSerivce = (email, code) => __awaiter(void 0, void 0, void 0, function* () {
    const verificationData = yield user_model_1.UserEmailVerificationCenter.findOne({ email });
    // if not found
    if (!verificationData) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Code didn't matched");
    }
    // check time
    if (verificationData.expireIn) {
        const expiryTime = new Date(verificationData.expireIn);
        const currentTime = new Date();
        if (currentTime > expiryTime) {
            throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Time expire');
        }
    }
    // check code match or not
    if (verificationData.code !== code) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Code didn't matched");
    }
    // make verified user
    const verified = yield user_model_1.default.findOneAndUpdate({ email }, { isVerified: true }, { upsert: true, new: true });
    const jwtPayload = {
        _id: verified._id,
        role: verified.role,
        email: verified.email,
        name: verified.name,
    };
    // create token and sent to the client
    const accessToken = (0, user_utils_1.createToken)(jwtPayload, config_1.default.JWT_ACCESS_SECRET, config_1.default.JWT_ACCESS_EXPIRES_ID);
    // create refresh token
    const refreshToken = (0, user_utils_1.createToken)(jwtPayload, config_1.default.REFRESH_SECRET, config_1.default.REFRESH_EXPIREIN);
    return {
        accessToken,
        refreshToken,
    };
});
// change user role
const changeUserRoleServices = (email, role) => __awaiter(void 0, void 0, void 0, function* () {
    // check if user exists
    const isExists = yield user_model_1.default.isUserExsitsByUserEmail(email);
    // check role is super or not
    if (isExists.role === 'super') {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Super Admin cannot be removed or modified.');
    }
    // check if user not exist in database
    if (!isExists) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'user not founed!');
    }
    const result = yield user_model_1.default.findOneAndUpdate({ email }, { role: role, needLogin: true }, { new: true, upsert: true });
    return result;
});
// add team member
const AddTeamMemberServices = (email, role) => __awaiter(void 0, void 0, void 0, function* () {
    const restricRole = ['admin', 'super', 'manager'];
    const user = yield user_model_1.default.isUserExsitsByUserEmail(email);
    // check user exist or not
    if (!user) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, 'User not found.');
    }
    // check if user already have team
    if (restricRole.includes(user.role)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'This user already team member.');
    }
    // check authentic role
    if (!restricRole.includes(role)) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, 'Please provide valid role (admin, super, manager)');
    }
    const result = yield user_model_1.default.findOneAndUpdate({ email }, { role: role, needLogin: true }, { new: true, upsert: true });
    return result;
});
// get all user service
const getAlluserFromDB = (query) => __awaiter(void 0, void 0, void 0, function* () {
    const mongoQuery = {};
    // handle role=admin,manager
    if (query.role && typeof query.role === 'string') {
        mongoQuery.role = { $in: query.role.split(',') };
    }
    // final output result
    const userQuery = new QueryBuilder_1.default(user_model_1.default.find(mongoQuery), query)
        .search(['email', 'name'])
        .filter()
        .fields()
        .paginate();
    const result = yield userQuery.modelQuery;
    // pagination info
    const total = yield user_model_1.default.countDocuments(mongoQuery);
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 10);
    const totalPages = Math.ceil(total / limit);
    return {
        meta: {
            total,
            page,
            limit,
            totalPages,
        },
        data: result,
    };
});
const userService = {
    changeUserRoleServices,
    createUserIntoDatabaseService,
    loginUserService,
    getSingleUserFromDBService,
    refreshTokenService,
    forgotPassowrdService,
    resetPasswordServices,
    handleOAuthService,
    createVerificationCodeService,
    verifyEmailSerivce,
    getAlluserFromDB,
    AddTeamMemberServices,
};
exports.default = userService;
