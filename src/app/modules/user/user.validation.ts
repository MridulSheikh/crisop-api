import { z } from 'zod';

const CreateUserValidationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'name is required' }),
    email: z.string({ required_error: 'email is required' }),
    password: z.string({ required_error: 'password is required' }),
    image: z.string({ required_error: 'image is required' }),
  }),
});

const UpdateUserValidatonSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().optional(),
    password: z.string().optional(),
    image: z.string().optional(),
  }),
});

const LoginUserValidationSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'email is required' }),
    password: z.string({ required_error: 'password is require' }),
  }),
});

const forgetPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string({required_error: "email is required"})
  })
})

const resetPasswordValidationSchema = z.object({
  body: z.object({
    password: z.string({ required_error: 'password is require' }),
    token: z.string({required_error: "token is required!"})
  })
})

const oAuthValidationSchema = z.object({
  body: z.object({
    accessToken: z.string({required_error: "accessToken is required"}),
    method: z.enum(["google","facebook"],{required_error: "method is required"})
  })
})

export {
  forgetPasswordValidationSchema,
  CreateUserValidationSchema,
  UpdateUserValidatonSchema,
  LoginUserValidationSchema,
  resetPasswordValidationSchema,
  oAuthValidationSchema
};
