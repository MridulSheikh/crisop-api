import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import { createOrderIntoDbSerivce, toggleOrderStatus } from "./order.service";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";

export const createOrderController = catchAsync(async(req: Request, res: Response)=>{
    const result = await createOrderIntoDbSerivce(req.body, req.user._id);
    
    sendResponse(res,{
        success: true,
        statusCode: httpStatus.OK,
        message: "Your order has been placed",
        data: result
    })
})

export const toggleOrderStatusController = catchAsync(async(req: Request, res: Response)=>{
    const result = await toggleOrderStatus(req.params.id, req.body.status);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: `Order under ${result.status} successfully`,
        data: result,
    })
})