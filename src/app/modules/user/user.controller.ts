import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import userService from './user.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';
import { clearAuthCookies, setAuthCookies } from '../../utils/authCookies';

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
  const { accessToken, refreshToken } =
    await userService.loginUserService(data);
  setAuthCookies(res, { accessToken, refreshToken });

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
    setAuthCookies(res, {
      accessToken: result.accessToken,
    });

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

const updateMyProfileController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await userService.updateMyProfileService(
      req.user.email,
      req.body,
      // eslint-disable-next-line no-undef
      req.file as Express.Multer.File | undefined,
    );

    setAuthCookies(res, {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });

    sendResponse(res, {
      success: true,
      message: 'Successfully updated profile',
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
      statusCode: httpStatus.OK,
    });
  },
);

const changeMyPasswordController = catchAsync(
  async (req: Request, res: Response) => {
    await userService.changeMyPasswordService(req.user.email, req.body);

    sendResponse(res, {
      success: true,
      message: 'Successfully changed password',
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
    setAuthCookies(res, { accessToken, refreshToken });

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
  const { accessToken, refreshToken } = result;
  setAuthCookies(res, { accessToken, refreshToken });
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

// add team member
const addTeamMemberController = catchAsync(
  async (req: Request, res: Response) => {
    const { email, role } = req.body;
    const result = await userService.AddTeamMemberServices(email, role);
    sendResponse(res, {
      success: true,
      message: 'Team member hasbeen added',
      data: result,
      statusCode: httpStatus.OK,
    });
  },
);

const getAllUserFromDB = catchAsync(async (req: Request, res: Response) => {
  const query = { ...req.query };

  const resData = await userService.getAlluserFromDB(query);

  sendResponse(res, {
    success: true,
    message: 'Successfully retrieved users',
    data: resData,
    statusCode: httpStatus.OK,
  });
});

const logOutMeController = catchAsync(async (_req: Request, res: Response) => {
  clearAuthCookies(res);

  sendResponse(res, {
    success: true,
    message: 'Successfully Logout users',
    data: null,
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
  addTeamMemberController,
  logOutMeController,
  updateMyProfileController,
  changeMyPasswordController,
};

export default userController;
