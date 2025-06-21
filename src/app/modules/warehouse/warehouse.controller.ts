import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import {
  createWarehouseService,
  deleteWarehousebyIdService,
  getAllWarehouseFromDBService,
  getSingleWarehoseByIdService,
  updateWarehousebyIdService,
} from './warehouse.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';

const createWarehouseIntoDbController = catchAsync(
  async (req: Request, res: Response) => {
    const reuslt = await createWarehouseService(req.body);
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Successfully create warehouse',
      data: reuslt,
    });
  },
);

const getAllWarehouseFromDbController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await getAllWarehouseFromDBService();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Successfully retrived warehouse',
      data: result,
    });
  },
);

const getSingleWareHouseByIdFromDBController = catchAsync(async (req: Request, res: Response)=>{
      const result = await getSingleWarehoseByIdService(req.params.id);

      sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: "Successfully retrived warehouse",
        data: result
      })
})


const updateWarehouseIntoDbController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await updateWarehousebyIdService(req.params.id, req.body);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Successfully updated warehouse',
      data: result,
    });
  },
);

const deleteWarehouseController = catchAsync(async (req: Request, res: Response)=>{
      const result = await deleteWarehousebyIdService(req.params.id);

      sendResponse(res,{
        success: true,
        statusCode: httpStatus.OK,
        message: "Successfully deleted warehouse",
        data: result._id
      })
})

export {
  createWarehouseIntoDbController,
  getAllWarehouseFromDbController,
  updateWarehouseIntoDbController,
  deleteWarehouseController,
  getSingleWareHouseByIdFromDBController
};
