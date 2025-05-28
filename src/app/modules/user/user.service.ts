import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { IUser } from './user.interface';
import User from './user.model';
import config from '../../config';
import { createToken } from './user.utils';
import mongoose from 'mongoose';
import jwt, { JwtPayload } from 'jsonwebtoken';
import path from 'path';
import ejs from 'ejs';
import sendEmail from '../../helpers/email';

// create user into database
const createUserIntoDatabaseService = async (payload: IUser) => {
  // is user exists on database
  const isUserExists = await User.isUserExsitsByUserEmail(payload.email);
  if (isUserExists) {
    throw new AppError(httpStatus.CONFLICT, 'This email already taken');
  }
  const result = await User.create(payload);
  return result;
};

// login user service
const loginUserService = async (payload: {
  email: string;
  password: string;
}) => {
  // is user exists on databse
  const isUserExists = await User.isUserExsitsByUserEmail(payload.email);
  // is password matched
  const isPasswordMatched = await User.isPasswordMatch(
    payload.password,
    isUserExists?.password,
  );
  if (!isUserExists || !isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Wrong credential input');
  }

  const jwtPayload = {
    _id: isUserExists._id as mongoose.Types.ObjectId,
    role: isUserExists.role,
    email: isUserExists.email,
  };

  // create token and sent to the client

  const accessToken = createToken(
    jwtPayload,
    config.JWT_ACCESS_SECRET as string,
    config.JWT_ACCESS_EXPIRES_ID as string,
  );

  // create refresh token
  const refreshToken = createToken(
    jwtPayload,
    config.REFRESH_SECRET as string,
    config.REFRESH_EXPIREIN as string,
  );

  // return jwt token
  return {
    accessToken,
    refreshToken,
  };
};

// get single user from db
const getSingleUserFromDBService = async (
  email: string,
  role: string,
  requestEmail: string,
) => {
  // validation for only admin or user can access this data
  const isValidRequest =
    requestEmail === email ? true : role === 'admin' ? true : false;
  if (!isValidRequest) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Invalid request');
  }
  const result = await User.findOne({ email: email });

  // if user not exist in database
  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, 'user not found!');
  }
  return result;
};

// refresh token serivce
const refreshTokenService = async (token: string) => {
  // checking if the give token is valid
  const decoded = jwt.verify(
    token,
    config.REFRESH_SECRET as string,
  ) as JwtPayload;

  const { email } = decoded;

  // checking if the user is exists
  const user = await User.isUserExsitsByUserEmail(email);
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User not found!');
  }

  const jwtPayload = {
    _id: user._id as mongoose.Types.ObjectId,
    role: user.role,
    email: user.email,
  };

  // create refresh token
  const refreshToken = createToken(
    jwtPayload,
    config.REFRESH_SECRET as string,
    config.REFRESH_EXPIREIN as string,
  );

  return {
    refreshToken,
  };
};

// forgot password
const forgotPassowrdService = async (email: string) => {
  // is user exists on databse
  const user = await User.isUserExsitsByUserEmail(email);
  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Invalid request, user not found!',
    );
  }
  const jwtPayload = {
    _id: user._id as mongoose.Types.ObjectId,
    role: user.role,
    email: user.email,
  };

  // create forgotPassword token
  const forgotPasswordToken = createToken(
    jwtPayload,
    config.REFRESH_SECRET as string,
    config.REFRESH_EXPIREIN as string,
  );

  // make reset password link
  const resetPasswordLink = `${config.NODE_ENV === 'development' ? 'https://localhost:3000' : config.CLIENT_URL}/reset-password?token=${forgotPasswordToken}`;

  const templatePath = path.join(
    // eslint-disable-next-line no-undef
    __dirname,
    '../../utils/templates/resetPassword/html.ejs',
  );

  const emailTemplate = await ejs.renderFile(templatePath, {
    name: user.name,
    resetLink: resetPasswordLink,
  });
  await sendEmail(user.email, "Action nedded! Reset your password", emailTemplate);
  return null;
};

const userService = {
  createUserIntoDatabaseService,
  loginUserService,
  getSingleUserFromDBService,
  refreshTokenService,
  forgotPassowrdService,
};

export default userService;
