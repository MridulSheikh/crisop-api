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
exports.UserEmailVerificationCenter = exports.ExpireResetPasswordLink = void 0;
const mongoose_1 = require("mongoose");
const user_interface_1 = require("./user.interface");
const bcrypt_1 = __importDefault(require("bcrypt"));
const config_1 = __importDefault(require("../../config"));
// Mongoose schema
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    authProvider: {
        type: String,
        enum: ["local", "google", "facebook"],
        default: "local",
    },
    password: {
        type: String,
        // eslint-disable-next-line no-unused-vars
        required: function () {
            return this.authProvider === "local";
        },
        select: 0,
    },
    image: {
        type: String,
        default: '',
    },
    role: {
        type: String,
        enum: Object.values(user_interface_1.UserRole),
        default: user_interface_1.UserRole.user,
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    needLogin: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
});
const expireResetPasswordLink = new mongoose_1.Schema({
    token: {
        type: String,
        require: true,
        unique: true,
    },
});
const userEmailVerificationCenter = new mongoose_1.Schema({
    email: {
        type: String,
        require: true,
    },
    code: {
        type: String,
        require: true,
    },
    expireIn: {
        type: Date,
        require: true,
    }
});
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const user = this;
        if (user.authProvider === "local") {
            user.password = yield bcrypt_1.default.hash(user.password, Number(config_1.default.BCRYPT_SALT));
        }
        next();
    });
});
userSchema.statics.isUserExsitsByUserName = function (username) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield User.findOne({ username }).select('+password');
        return result;
    });
};
userSchema.statics.isUserExsitsByUserEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield User.findOne({ email }).select('+password');
    return result;
});
userSchema.statics.isPasswordMatch = function (plainTextPassword, hashedPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(plainTextPassword, hashedPassword);
    });
};
const User = (0, mongoose_1.model)('User', userSchema);
exports.ExpireResetPasswordLink = (0, mongoose_1.model)('ExpireResetPasswordLink', expireResetPasswordLink);
exports.UserEmailVerificationCenter = (0, mongoose_1.model)("userEmailVerificationCenter", userEmailVerificationCenter);
exports.default = User;
