import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import userService from './user.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import config from '../../config';

const createUserIntoDatabseController = catchAsync(
  async (req: Request, res: Response) => {
    const data = req.body;
    await userService.createUserIntoDatabaseService(data);
    sendResponse(res, {
      success: true,
      message: 'Successfully Create user',
      data: null,
      statusCode: httpStatus.OK,
    });
  },
);

const loginUserController = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const { accessToken, refreshToken, role } =
    await userService.loginUserService(data);

  res.cookie('refreshToken', refreshToken, {
    secure: config.NODE_ENV === 'production' ,
    httpOnly: true,
  });

  res.cookie('role', role, {
    secure: config.NODE_ENV === 'production',
    httpOnly: false,
  });

  res.cookie('accessToken', accessToken, {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
  });
  sendResponse(res, {
    success: true,
    message: 'Successfully logged in user',
    data: {
      accessToken,
    },
    statusCode: httpStatus.OK,
  });
});

const getSingleUserFromDBController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await userService.getSingleUserFromDBService(
      req.params.email,
      req.user.role,
      req.user.email,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      message: 'successfully retreved user',
      data: result,
      success: true,
    });
  },
);

const refreshTokenController = catchAsync(
  async (req: Request, res: Response) => {
    const { refreshToken } = req.cookies;
    const result = await userService.refreshTokenService(refreshToken);
    sendResponse(res, {
      success: true,
      message: 'Successfully token refreshed',
      data: result,
      statusCode: httpStatus.OK,
    });
  },
);

const forgetPasswordController = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await userService.forgotPassowrdService(email);
    sendResponse(res, {
      success: true,
      message: 'We are send reset password link, please check your email',
      data: result,
      statusCode: httpStatus.OK,
    });
  },
);

const resetPasswordContorller = catchAsync(
  async (req: Request, res: Response) => {
    const { password, token } = req.body;
    await userService.resetPasswordServices(token, password);
    sendResponse(res, {
      success: true,
      message: 'Successfully reset password',
      data: null,
      statusCode: httpStatus.OK,
    });
  },
);

const handleOAuthController = catchAsync(
  async (req: Request, res: Response) => {
    const { accessToken: token, method } = req.body;
    const { accessToken, refreshToken } = await userService.handleOAuthService(
      token,
      method,
    );
    res.cookie('refreshToken', refreshToken, {
      secure: config.NODE_ENV === 'production' ? true : false,
      httpOnly: true,
    });
    sendResponse(res, {
      success: true,
      message: 'Successfully logged in account',
      data: {
        accessToken,
      },
      statusCode: httpStatus.OK,
    });
  },
);

// create verification code service
const createVerificationCodeController = catchAsync(
  async (req: Request, res: Response) => {
    await userService.createVerificationCodeService(req.params.email);
    sendResponse(res, {
      success: true,
      message: 'successfully create code',
      data: null,
      statusCode: httpStatus.OK,
    });
  },
);

// verify code
const verfiyCodeController = catchAsync(async (req: Request, res: Response) => {
  const { email, code } = req.body;
  const result = await userService.verifyEmailSerivce(email, code);
  sendResponse(res, {
    success: true,
    message: 'user successfully verified',
    data: result,
    statusCode: httpStatus.OK,
  });
});

// change user role controller
const changeUserRoleController = catchAsync(
  async (req: Request, res: Response) => {
    const { email, role } = req.body;
    const result = await userService.changeUserRoleServices(email, role);

    sendResponse(res, {
      success: true,
      message: 'user role successfully changed',
      data: result,
      statusCode: httpStatus.OK,
    });
  },
);

// get all user controller
const getAllUserFromDB = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const resData = await userService.getAlluserFromDB(query);

  sendResponse(res, {
    success: true,
    message: 'successfully retrived user',
    data: resData,
    statusCode: httpStatus.OK,
  });
});

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
};

export default userController;
