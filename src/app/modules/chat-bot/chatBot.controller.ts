import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { chatService } from "./chatBot.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

export const analyzeMessageContorller = catchAsync(async(req: Request, res: Response)=>{
      const {message, id} = req.body
      const result = await chatService(message, id);
      sendResponse(res,{
        statusCode: httpStatus.OK,
        success: true,
        message: "Successfully got message",
        data: result
      })
})