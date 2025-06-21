import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { Request, Response } from "express";
import { createStockIntoDBService, getAllStockFromDBService, getSingleStockFromDBService, removedSingleStockFromDBService, updateSingleStockFromDbService } from "./stock.service";

const createStockeIntoDbController = catchAsync(async(req: Request, res: Response) => {
    const result = await createStockIntoDBService(req.body)

    sendResponse(res,{
        statusCode: httpStatus.OK,
        success: true,
        message: "Successfully create stock",
        data: result
    })
})

const getAllStockFromDBController = catchAsync(async(req: Request, res: Response)=>{
    const result = await getAllStockFromDBService();

    sendResponse(res,{
        statusCode: httpStatus.OK,
        success: true,
        message: "Successfully retrived stock",
        data: result
    })
})

const getSingleStockFromDBController = catchAsync(async(req: Request, res: Response)=>{
     const result = await getSingleStockFromDBService(req.params.id);

     sendResponse(res,{
        statusCode: httpStatus.OK,
        success: true,
        message: "Successfully retrived stock",
        data: result
     })
})

const softDeleteController = catchAsync(async (req: Request, res: Response)=>{
      const result = await removedSingleStockFromDBService(req.params.id);

      sendResponse(res,{
        statusCode: httpStatus.OK,
        success: true,
        message: "Successfully Delete Stock",
        data: result
      })
})

const updateStockController = catchAsync(async (req: Request, res: Response)=>{
      const result = await updateSingleStockFromDbService(req.params.id, req.body);

       sendResponse(res,{
        statusCode: httpStatus.OK,
        success: true,
        message: "Successfully updated Stock",
        data: result
      })
})

export {
    createStockeIntoDbController,
    getAllStockFromDBController,
    getSingleStockFromDBController,
    softDeleteController,
    updateStockController
}