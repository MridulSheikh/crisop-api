import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { stripePaymentServices } from "./payment.services";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

export const stripePaymentIntent = catchAsync(async (req: Request, res: Response)=>{
    const userEmail = req.user.email;
    const items = req.body.items
    const result = await stripePaymentServices({items, userEmail});
    sendResponse(res,{
        statusCode: httpStatus.OK,
        success: true,
        message: "Ready to go!",
        data: result,
    })
}) 