import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import {
  createBrandIntoDBService,
  getAllBrandFromDBService,
  getSingleBrandFromDBService,
  hardDeleteBrandFromDBService,
  softDeleteBrandFromDBService,
  updateBrandIntoDBService,
} from './brand.service';

const createBrandIntoDBController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await createBrandIntoDBService(
      req.body,
      // eslint-disable-next-line no-undef
      req.file as Express.Multer.File,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Successfully created brand',
      data: result,
    });
  },
);

const getAllBrandFromDBController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await getAllBrandFromDBService(req.query);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Successfully retrived brands',
      data: result,
    });
  },
);

const getSingleBrandFromDBController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await getSingleBrandFromDBService(req.params.id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Successfully retrived brand',
      data: result,
    });
  },
);

const updateBrandIntoDBController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await updateBrandIntoDBService(
      req.params.id,
      req.body,
      // eslint-disable-next-line no-undef
      req.file as Express.Multer.File | undefined,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Successfully updated brand',
      data: result,
    });
  },
);

const softDeleteBrandFromDBController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await softDeleteBrandFromDBService(req.params.id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Successfully soft deleted brand',
      data: result,
    });
  },
);

const hardDeleteBrandFromDBController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await hardDeleteBrandFromDBService(req.params.id);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: 'Successfully hard deleted brand',
      data: result,
    });
  },
);

export {
  createBrandIntoDBController,
  getAllBrandFromDBController,
  getSingleBrandFromDBController,
  hardDeleteBrandFromDBController,
  softDeleteBrandFromDBController,
  updateBrandIntoDBController,
};
