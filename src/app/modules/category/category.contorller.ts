import { Request, Response } from 'express';
import catchAsync from '../../utils/catchAsync';
import {
  createCategoryIntoDBService,
  deleCateogryService,
  getAllCategoryFromDBService,
  getSingleCategoryFromDbService,
  updateOneCateogryIntoDBService,
} from './category.service';
import sendResponse from '../../utils/sendResponse';
import httpStatus from 'http-status';

const createCategoryIntoDatabseController = catchAsync(
  async (req: Request, res: Response) => {
    const data = req.body;
    const result = await createCategoryIntoDBService(data);
    sendResponse(res, {
      success: true,
      message: 'Successfully Create Category',
      data: result,
      statusCode: httpStatus.OK,
    });
  },
);

const getAllCategoriesFromDBController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await getAllCategoryFromDBService();
    sendResponse(res, {
      success: true,
      message: 'Successfully retrived categories',
      data: result,
      statusCode: httpStatus.OK,
    });
  },
);

const getSingleCategoryFromDbController = catchAsync(
  async(req: Request, res: Response)=>{
    const result = await getSingleCategoryFromDbService(req.params.id);
    sendResponse(res, {
      success: true,
      message: 'Successfully retrived category',
      data: result,
      statusCode: httpStatus.OK,
    });
  }
)

const updateOneCateogryIntoDBController = catchAsync(
  async (req: Request, res: Response) => {
    const result = await updateOneCateogryIntoDBService(
      req.params.id,
      req.body,
    );
    sendResponse(res, {
      success: true,
      message: 'Successfully update category',
      data: result,
      statusCode: httpStatus.OK,
    });
  },
);

// delete category from db controller
const deleteOneCategoryController = catchAsync(async(req: Request, res: Response)=>{
   const result = await deleCateogryService(req.params.id);
   sendResponse(res, {
      success: true,
      message: 'Successfully removed category',
      data: result,
      statusCode: httpStatus.OK,
    });
})

export {
  createCategoryIntoDatabseController,
  getAllCategoriesFromDBController,
  updateOneCateogryIntoDBController,
  deleteOneCategoryController,
  getSingleCategoryFromDbController
};
