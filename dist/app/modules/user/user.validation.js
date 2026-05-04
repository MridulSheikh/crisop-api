"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.oAuthValidationSchema = exports.resetPasswordValidationSchema = exports.LoginUserValidationSchema = exports.UpdateUserValidatonSchema = exports.CreateUserValidationSchema = exports.forgetPasswordValidationSchema = void 0;
const zod_1 = require("zod");
const CreateUserValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string({ required_error: 'name is required' }),
        email: zod_1.z.string({ required_error: 'email is required' }),
        password: zod_1.z.string({ required_error: 'password is required' }),
        image: zod_1.z.string({ required_error: 'image is required' }),
    }),
});
exports.CreateUserValidationSchema = CreateUserValidationSchema;
const UpdateUserValidatonSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().optional(),
        email: zod_1.z.string().optional(),
        password: zod_1.z.string().optional(),
        image: zod_1.z.string().optional(),
    }),
});
exports.UpdateUserValidatonSchema = UpdateUserValidatonSchema;
const LoginUserValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({ required_error: 'email is required' }),
        password: zod_1.z.string({ required_error: 'password is require' }),
    }),
});
exports.LoginUserValidationSchema = LoginUserValidationSchema;
const forgetPasswordValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string({ required_error: "email is required" })
    })
});
exports.forgetPasswordValidationSchema = forgetPasswordValidationSchema;
const resetPasswordValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        password: zod_1.z.string({ required_error: 'password is require' }),
        token: zod_1.z.string({ required_error: "token is required!" })
    })
});
exports.resetPasswordValidationSchema = resetPasswordValidationSchema;
const oAuthValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        accessToken: zod_1.z.string({ required_error: "accessToken is required" }),
        method: zod_1.z.enum(["google", "facebook"], { required_error: "method is required" })
    })
});
exports.oAuthValidationSchema = oAuthValidationSchema;
