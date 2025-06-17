import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import userService from "./user.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import config from "../../config";


const createUserIntoDatabseController = catchAsync(async(req: Request, res: Response)=>{
         const data = req.body;
         await userService.createUserIntoDatabaseService(data)
         sendResponse(res,{
            success: true,
            message: "Successfully Create user",
            data: null,
            statusCode: httpStatus.OK
         })
})

const loginUserController = catchAsync(async(req: Request, res: Response)=>{
       const data = req.body
        const {accessToken, refreshToken} = await userService.loginUserService(data)

        res.cookie("refreshToken", refreshToken, {
            secure: config.NODE_ENV === "production"? true : false,
            httpOnly: true
        })
        sendResponse(res,{
            success: true,
            message: "Successfully logged in user",
            data: {
                accessToken,
            },
            statusCode: httpStatus.OK
        })
})

const getSingleUserFromDBController = catchAsync(async(req: Request, res: Response)=>{
     const result = await userService.getSingleUserFromDBService(req.params.email, req.user.role, req.user.email);
     sendResponse(res, 
        {
            statusCode: httpStatus.OK,
            message: "successfully retreved user",
            data: result,
            success: true,
        }
     )
})

const refreshTokenController = catchAsync(async(req: Request, res: Response)=>{
    const {refreshToken} = req.cookies;
    const result = await userService.refreshTokenService(refreshToken);
     sendResponse(res,{
            success: true,
            message: "Successfully token refreshed",
            data: result,
            statusCode: httpStatus.OK
        })
})

const forgetPasswordController = catchAsync(async(req: Request, res: Response) => {
      const {email} = req.body;
      const result = await userService.forgotPassowrdService(email);
      sendResponse(res,{
        success: true,
        message: "We are send reset password link, please check your email",
        data: result,
        statusCode: httpStatus.OK
      })
})

const resetPasswordContorller = catchAsync(async(req: Request, res: Response)=>{
     const token = req.headers.authorization;
     const {password} = req.body;
     await userService.resetPasswordServices(token as string, password);

     sendResponse(res,{
        success: true,
        message: "Successfully reset password",
        data: null,
        statusCode: httpStatus.OK
     })
})

const userController = {
    forgetPasswordController,
    createUserIntoDatabseController,
    loginUserController,
    getSingleUserFromDBController,
    refreshTokenController,
    resetPasswordContorller
}

export default userController;