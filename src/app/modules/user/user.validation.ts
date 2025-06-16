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

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({required_error: "refresh token is required!"})
  })
})

const forgetPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string({required_error: "email is required"})
  })
})

const resetPasswordValidationSchema = z.object({
  body: z.object({
    password: z.string({ required_error: 'password is require' }),
  })
})

export {
  forgetPasswordValidationSchema,
  CreateUserValidationSchema,
  UpdateUserValidatonSchema,
  LoginUserValidationSchema,
  refreshTokenValidationSchema,
  resetPasswordValidationSchema
};
