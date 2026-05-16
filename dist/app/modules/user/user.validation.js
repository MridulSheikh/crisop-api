"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePasswordValidationSchema = exports.updateMyProfileValidationSchema = exports.oAuthValidationSchema = exports.resetPasswordValidationSchema = exports.LoginUserValidationSchema = exports.UpdateUserValidatonSchema = exports.CreateUserValidationSchema = exports.forgetPasswordValidationSchema = void 0;
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
const updateMyProfileValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1).optional(),
        email: zod_1.z.string().email().optional(),
        currentPassword: zod_1.z.string().optional(),
    }),
});
exports.updateMyProfileValidationSchema = updateMyProfileValidationSchema;
const changePasswordValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.string({ required_error: 'current password is required' }),
        newPassword: zod_1.z.string({ required_error: 'new password is required' }).min(8),
    }),
});
exports.changePasswordValidationSchema = changePasswordValidationSchema;
