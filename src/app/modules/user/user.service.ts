import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { IUser, UserRole } from './user.interface';
import User, {
  ExpireResetPasswordLink,
  UserEmailVerificationCenter,
} from './user.model';
import config from '../../config';
import { createToken } from './user.utils';
import mongoose from 'mongoose';
import jwt, { JwtPayload } from 'jsonwebtoken';
import path from 'path';
import ejs from 'ejs';
import sendEmail from '../../helpers/email';
import bcrypt from 'bcrypt';
import fs from 'fs';
import { fetchGoogleUserInfo } from '../../utils/fetchGoogleUserInfo';
import { fetchFacebookUserInfo } from '../../utils/fechFacebookUserInfo';
import { generateVerificationCode } from '../../utils/generateVerificationCode';
import QueryBuilder from '../../builder/QueryBuilder';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';

// create user into database
const createUserIntoDatabaseService = async (payload: IUser) => {
  // is user exists on database
  const isUserExists = await User.isUserExsitsByUserEmail(payload.email);
  if (isUserExists) {
    throw new AppError(httpStatus.CONFLICT, 'This email already taken');
  }
  const newUser = await User.create(payload);
  // send verification mail
  await createVerificationCodeService(newUser.email);
  return newUser;
};

// login user service
const loginUserService = async (payload: {
  email: string;
  password: string;
}) => {
  // is user exists on databse
  const isUserExists = await User.isUserExsitsByUserEmail(payload.email);
  if (!isUserExists) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Wrong credential input');
  }
  // is password matched
  const isPasswordMatched = await User.isPasswordMatch(
    payload.password,
    isUserExists?.password,
  );
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Wrong credential input');
  }

  // check is user verified or not
  if (!isUserExists.isVerified) {
    await createVerificationCodeService(payload.email);
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You are not verified, please check your email!',
    );
  }

  // update user need user login status
  await User.findOneAndUpdate({ email: payload.email }, { needLogin: false });

  const jwtPayload = {
    _id: isUserExists._id as mongoose.Types.ObjectId,
    role: isUserExists.role,
    email: isUserExists.email,
    name: isUserExists.name,
    image: isUserExists.image,
    authProvider: isUserExists.authProvider,
  };

  // create token and sent to the client

  const accessToken = createToken(
    jwtPayload,
    config.JWT_ACCESS_SECRET as string,
    config.JWT_ACCESS_EXPIRES_ID as any,
  );

  // create refresh token
  const refreshToken = createToken(
    jwtPayload,
    config.REFRESH_SECRET as string,
    config.REFRESH_EXPIREIN as any,
  );

  // return jwt token
  return {
    accessToken,
    refreshToken,
    role: isUserExists.role,
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
    name: user.name,
    image: user.image,
    authProvider: user.authProvider,
  };

  // create refresh token
  const accessToken = createToken(
    jwtPayload,
    config.JWT_ACCESS_SECRET as string,
    config.JWT_ACCESS_EXPIRES_ID as any,
  );

  return {
    accessToken,
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
    config.JWT_RESETPASSWORD_TOKEN_SECRET as string,
    config.JWT_RESETPASSWORD_TOKEN_EXPIREIN as any,
  );

  // make reset password link
  const resetPasswordLink = `${config.NODE_ENV === 'development' ? 'http://localhost:3000' : config.CLIENT_URL}/reset-password?token=${forgotPasswordToken}`;

  const templatePath = path.join(
    // eslint-disable-next-line no-undef
    __dirname,
    '../../utils/templates/resetPassword/html.ejs',
  );

  const emailTemplate = await ejs.renderFile(templatePath, {
    name: user.name,
    resetLink: resetPasswordLink,
  });
  await sendEmail(
    user.email,
    'Action nedded! Reset your password',
    emailTemplate,
  );
  return null;
};

// Reset password
const resetPasswordServices = async (token: string, password: string) => {
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not Authorized');
  }

  const decoded = jwt.verify(
    token,
    config.JWT_RESETPASSWORD_TOKEN_SECRET as string,
  ) as JwtPayload;

  const { email } = decoded;

  const user = await User.isUserExsitsByUserEmail(email);

  // if user not exist
  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Invalid request, user not found!',
    );
  }

  // if resetlink not expire
  const ifLinkExpire = await ExpireResetPasswordLink.findOne({ token: token });

  if (ifLinkExpire) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Invalid request, link already expire',
    );
  }

  // // hased password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Update the user's password in DB
  await User.findOneAndUpdate(
    { email },
    {
      password: hashedPassword,
    },
  );

  // make jwt expire after one time use
  await ExpireResetPasswordLink.create({ token });
};

const createUserTokens = (user: IUser) => {
  const jwtPayload = {
    _id: user._id as mongoose.Types.ObjectId,
    role: user.role,
    email: user.email,
    name: user.name,
    image: user.image,
    authProvider: user.authProvider,
  };

  const accessToken = createToken(
    jwtPayload,
    config.JWT_ACCESS_SECRET as string,
    config.JWT_ACCESS_EXPIRES_ID as any,
  );

  const refreshToken = createToken(
    jwtPayload,
    config.REFRESH_SECRET as string,
    config.REFRESH_EXPIREIN as any,
  );

  return { accessToken, refreshToken };
};

const updateMyProfileService = async (
  requestEmail: string,
  payload: { name?: string; email?: string; currentPassword?: string },
  // eslint-disable-next-line no-undef
  file?: Express.Multer.File,
) => {
  const user = await User.isUserExsitsByUserEmail(requestEmail);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  const updateData: Partial<IUser> = {};

  if (payload.name) {
    updateData.name = payload.name;
  }

  if (payload.email && payload.email !== user.email) {
    if (user.authProvider !== 'local') {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Email change is only available for email/password accounts',
      );
    }

    if (!payload.currentPassword) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'Current password is required to change email',
      );
    }

    const isPasswordMatched = await User.isPasswordMatch(
      payload.currentPassword,
      user.password,
    );

    if (!isPasswordMatched) {
      throw new AppError(httpStatus.UNAUTHORIZED, 'Current password is wrong');
    }

    const emailOwner = await User.findOne({ email: payload.email });

    if (emailOwner) {
      throw new AppError(httpStatus.CONFLICT, 'This email already taken');
    }

    updateData.email = payload.email;
  }

  if (file) {
    const uploadedImage = await sendImageToCloudinary(file.path, {
      folder: 'users',
    });

    updateData.image = uploadedImage.url;
    fs.unlinkSync(file.path);
  }

  if (!Object.keys(updateData).length) {
    throw new AppError(httpStatus.BAD_REQUEST, 'No profile changes provided');
  }

  const updatedUser = await User.findOneAndUpdate(
    { email: requestEmail },
    updateData,
    { new: true },
  );

  if (!updatedUser) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Profile not updated');
  }

  return {
    user: updatedUser,
    ...createUserTokens(updatedUser),
  };
};

const changeMyPasswordService = async (
  requestEmail: string,
  payload: { currentPassword: string; newPassword: string },
) => {
  const user = await User.isUserExsitsByUserEmail(requestEmail);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found!');
  }

  if (user.authProvider !== 'local') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Password change is only available for email/password accounts',
    );
  }

  const isPasswordMatched = await User.isPasswordMatch(
    payload.currentPassword,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Current password is wrong');
  }

  const hashedPassword = await bcrypt.hash(payload.newPassword, 10);

  await User.findOneAndUpdate(
    { email: requestEmail },
    { password: hashedPassword },
  );

  return null;
};

// Oauth login
const handleOAuthService = async (token: string, method: string) => {
  let oauthUser;

  if (method === 'google') {
    oauthUser = await fetchGoogleUserInfo(token);
  }

  if (method === 'facebook') {
    oauthUser = await fetchFacebookUserInfo(token);
  }
  if (!oauthUser?.email) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'There was a problem with this Google account. Please try another.',
    );
  }

  let user = await User.isUserExsitsByUserEmail(oauthUser.email as string);

  // if user does not exist database
  if (!user) {
    user = await User.create({
      name: oauthUser.name,
      email: oauthUser.email,
      image: oauthUser.image,
      isVerified: true,
      authProvider: method,
    });
  }

  if (!user.isVerified) {
    user = await User.findOneAndUpdate(
      { email: user.email },
      { isVerified: true },
      { new: true, upsert: true },
    );
  }

  // update user need user login status
  await User.findOneAndUpdate({ email: user.email }, { needLogin: false });

  const jwtPayload = {
    _id: user._id as mongoose.Types.ObjectId,
    role: user.role,
    email: user.email,
    name: user.name,
    image: user.image,
    authProvider: user.authProvider,
  };

  // generate jwt token
  const accessToken = createToken(
    jwtPayload,
    config.JWT_ACCESS_SECRET as string,
    config.JWT_ACCESS_EXPIRES_ID as any,
  );

  // create refresh token
  const refreshToken = createToken(
    jwtPayload,
    config.REFRESH_SECRET as string,
    config.REFRESH_EXPIREIN as any,
  );

  return {
    accessToken,
    refreshToken,
  };
};

// create verification code service
const createVerificationCodeService = async (email: string) => {
  // check is user exist
  const user = await User.isUserExsitsByUserEmail(email);

  if (!user) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Invalid request, user not found!',
    );
  }

  const code = generateVerificationCode();
  const expireIn = new Date(Date.now() + 3 * 60 * 1000);

  // save and update verification code into DB
  await UserEmailVerificationCenter.findOneAndUpdate(
    { email },
    {
      email,
      code,
      expireIn,
    },
    { upsert: true, new: true },
  );
  // send code via email
  const templatePath = path.join(
    // eslint-disable-next-line no-undef
    __dirname,
    '../../utils/templates/varification/email-verification.ejs',
  );

  const emailTemplate = await ejs.renderFile(templatePath, {
    name: user.name,
    code: code,
  });
  await sendEmail(
    user.email,
    'Action nedded! verify your email address',
    emailTemplate,
  );

  return null;
};

// verify email service
const verifyEmailSerivce = async (email: string, code: string) => {
  const verificationData = await UserEmailVerificationCenter.findOne({ email });

  // if not found
  if (!verificationData) {
    throw new AppError(httpStatus.BAD_REQUEST, "Code didn't matched");
  }

  // check time
  if (verificationData.expireIn) {
    const expiryTime = new Date(verificationData.expireIn);
    const currentTime = new Date();
    if (currentTime > expiryTime) {
      throw new AppError(httpStatus.BAD_REQUEST, 'Time expire');
    }
  }

  // check code match or not
  if (verificationData.code !== code) {
    throw new AppError(httpStatus.BAD_REQUEST, "Code didn't matched");
  }

  // make verified user
  const verified = await User.findOneAndUpdate(
    { email },
    { isVerified: true },
    { upsert: true, new: true },
  );

  const jwtPayload = {
    _id: verified._id as mongoose.Types.ObjectId,
    role: verified.role,
    email: verified.email,
    name: verified.name,
    image: verified.image,
    authProvider: verified.authProvider,
  };

  // create token and sent to the client

  const accessToken = createToken(
    jwtPayload,
    config.JWT_ACCESS_SECRET as string,
    config.JWT_ACCESS_EXPIRES_ID as any,
  );

  // create refresh token
  const refreshToken = createToken(
    jwtPayload,
    config.REFRESH_SECRET as string,
    config.REFRESH_EXPIREIN as any,
  );

  return {
    accessToken,
    refreshToken,
  };
};

// change user role
const changeUserRoleServices = async (email: string, role: UserRole) => {
  // check if user exists
  const isExists = await User.isUserExsitsByUserEmail(email);
  // check role is super or not
  if (isExists.role === 'super') {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Super Admin cannot be removed or modified.',
    );
  }
  // check if user not exist in database
  if (!isExists) {
    throw new AppError(httpStatus.NOT_FOUND, 'user not founed!');
  }
  const result = await User.findOneAndUpdate(
    { email },
    { role: role, needLogin: true },
    { new: true, upsert: true },
  );
  return result;
};

// add team member
const AddTeamMemberServices = async (email: string, role: UserRole) => {
  const restricRole = ['admin', 'super', 'manager'];

  const user = await User.isUserExsitsByUserEmail(email);

  // check user exist or not
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found.');
  }

  // check if user already have team
  if (restricRole.includes(user.role)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This user already team member.',
    );
  }
  // check authentic role
  if (!restricRole.includes(role)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Please provide valid role (admin, super, manager)',
    );
  }
  const result = await User.findOneAndUpdate(
    { email },
    { role: role, needLogin: true },
    { new: true, upsert: true },
  );
  return result;
};

// get all user service
const getAlluserFromDB = async (query: Record<string, unknown>) => {
  const mongoQuery: Record<string, unknown> = {};

  // handle role=admin,manager
  if (query.role && typeof query.role === 'string') {
    mongoQuery.role = { $in: query.role.split(',') };
  }

  // final output result
  const userQuery = new QueryBuilder(User.find(mongoQuery), query)
    .search(['email', 'name'])
    .filter()
    .fields()
    .paginate();

  const result = await userQuery.modelQuery;

  // pagination info

  const total = await User.countDocuments(mongoQuery);
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
};

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
  updateMyProfileService,
  changeMyPasswordService,
};

export default userService;
